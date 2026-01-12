import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload route called")

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log("[v0] Available cookies:", allCookies.map((c) => c.name).join(", "))

    const formData = await request.formData()
    console.log("[v0] FormData received")

    const file = formData.get("file") as File
    const spotIdsJson = formData.get("spotIds") as string

    console.log("[v0] File:", file ? `${file.name} (${file.size} bytes)` : "null")
    console.log("[v0] SpotIds JSON:", spotIdsJson)

    if (!file || !spotIdsJson) {
      console.log("[v0] Missing file or spotIds")
      return NextResponse.json({ error: "Missing file or spot IDs" }, { status: 400 })
    }

    const spotIds = JSON.parse(spotIdsJson)
    console.log("[v0] Parsed spotIds:", spotIds)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user authentication using regular client
    const { createClient: createUserClient } = await import("@/lib/supabase/server")
    const userSupabase = await createUserClient()

    const {
      data: { session },
      error: sessionError,
    } = await userSupabase.auth.getSession()

    console.log("[v0] Session:", session ? `exists (user: ${session.user.id})` : "null")
    if (sessionError || !session?.user) {
      console.log("[v0] Session error or unauthorized:", sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    console.log("[v0] Converting file to array buffer...")
    const arrayBuffer = await file.arrayBuffer()
    console.log("[v0] Array buffer created, size:", arrayBuffer.byteLength)

    // Upload to Supabase Storage using admin client
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    console.log("[v0] Uploading to storage:", fileName)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("ad-copy")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json(
        {
          error: "Failed to upload file to storage",
          details: uploadError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] File uploaded successfully:", uploadData)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("ad-copy").getPublicUrl(fileName)

    console.log("[v0] Public URL:", publicUrl)

    // Update ad spots with the uploaded file URL using admin client
    console.log("[v0] Updating ad spots...")
    const { error: updateError } = await supabaseAdmin
      .from("ad_spots")
      .update({
        ad_copy_url: publicUrl,
        status: "uploaded",
      })
      .in("id", spotIds)
      .eq("advertiser_id", user.id)

    if (updateError) {
      console.error("[v0] Database update error:", updateError)
      return NextResponse.json(
        {
          error: "Failed to update ad spots",
          details: updateError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Ad spots updated")

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error("[v0] Upload route error:", error)
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
