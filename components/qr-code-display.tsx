"use client"

import { useEffect, useRef, useCallback } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type QRCodeDisplayProps = {
  url: string
  size?: number
  showDownload?: boolean
}

export function QRCodeDisplay({ url, size = 256, showDownload = false }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("[v0] QR Code generation error:", error)
        },
      )
    }
  }, [url, size])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg border" />
      {showDownload && (
        <Button onClick={handleDownload} size="lg" className="w-full max-w-xs">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      )}
    </div>
  )
}
