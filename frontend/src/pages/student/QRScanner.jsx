import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { scanQR } from '../../api/attendance'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { HiCamera, HiCheckCircle, HiXCircle } from 'react-icons/hi'

export default function QRScanner() {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { success, message }
  const [loading, setLoading] = useState(false)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
    }
    setScanning(false)
  }

  const startScanner = async () => {
    setResult(null)
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    setScanning(true)

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner()
          await handleScan(decodedText)
        },
        () => {} // ignore non-QR frames
      )
    } catch (err) {
      setScanning(false)
      toast.error('Camera access denied. Please allow camera permissions.')
    }
  }

  const handleScan = async (text) => {
    setLoading(true)
    try {
      const data = JSON.parse(text)
      if (!data.session_id || !data.token) throw new Error('Invalid QR format')

      // Get geolocation
      let latitude = null, longitude = null
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }))
        latitude = pos.coords.latitude
        longitude = pos.coords.longitude
      } catch {}

      await scanQR({ session_id: data.session_id, token: data.token, latitude, longitude })
      setResult({ success: true, message: 'Attendance marked successfully!' })
      toast.success('Attendance recorded!')
    } catch (err) {
      const msg = err.message === 'Invalid QR format'
        ? 'Invalid QR code. Please scan a valid attendance QR.'
        : getErrorMessage(err)
      setResult({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => { if (scannerRef.current) { try { scannerRef.current.stop() } catch {} } }
  }, [])

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Scan QR Code</h1>

      {result && (
        <div className={`card flex items-start gap-3 ${result.success ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'}`}>
          {result.success
            ? <HiCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-0.5" />
            : <HiXCircle className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
          }
          <p className={`text-sm font-medium ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {result.message}
          </p>
        </div>
      )}

      <div className="card">
        <div id="qr-reader" className="w-full rounded-lg overflow-hidden" style={{ minHeight: scanning ? 300 : 0 }} />

        {!scanning && !loading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <HiCamera className="text-blue-600 text-4xl" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Ready to scan</p>
              <p className="text-sm text-gray-400 mt-1">Point your camera at the QR code displayed by your teacher</p>
            </div>
            <button onClick={startScanner} className="btn-primary">
              Start Camera
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-300">Processing attendance...</span>
          </div>
        )}

        {scanning && !loading && (
          <div className="mt-4 text-center">
            <button onClick={stopScanner} className="btn-danger">Stop Scanner</button>
            <p className="text-xs text-gray-400 mt-2">Align QR code within the frame</p>
          </div>
        )}
      </div>
    </div>
  )
}
