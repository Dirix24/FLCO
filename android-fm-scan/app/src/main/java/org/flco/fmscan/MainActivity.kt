package org.flco.fmscan

import android.app.Activity
import android.os.Bundle
import android.hardware.usb.UsbManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/**
 * Diagnóstico local: nunca interpreta un chip de Wi-Fi o una app instalada
 * como prueba de recepción FM. No necesita permiso INTERNET.
 */
class MainActivity : Activity() {
    private lateinit var result: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 40, 32, 32)
        }
        val title = TextView(this).apply {
            text = "FLCO · Comprobación de radio sin Internet"
            textSize = 23f
        }
        val button = Button(this).apply {
            text = "Escanear receptores disponibles"
            setOnClickListener { scan() }
        }
        result = TextView(this).apply { textSize = 16f }
        layout.addView(title)
        layout.addView(button)
        layout.addView(result)
        setContentView(ScrollView(this).apply { addView(layout) })
        scan()
    }

    private fun scan() {
        val manager = getSystemService(USB_SERVICE) as UsbManager
        val devices = manager.deviceList.values.toList()
        val usbHost = packageManager.hasSystemFeature("android.hardware.usb.host")
        val known = devices.filter { device ->
            // Realtek RTL2832U: VID 0x0bda, PID 0x2832 or 0x2838.
            // Otros RTL-SDR usan IDs distintos y pueden no detectarse aquí.
            device.vendorId == 0x0bda &&
                (device.productId == 0x2832 || device.productId == 0x2838)
        }
        val report = StringBuilder()
        report.appendLine("USB host: " + if (usbHost) "disponible" else "no anunciado por Android")
        report.appendLine("Dispositivos USB visibles: ${devices.size}")
        if (known.isNotEmpty()) {
            report.appendLine("RTL-SDR reconocido: ${known.size}")
            report.appendLine("Estado: receptor USB detectado, pero aún NO verificado para recibir FM.")
            report.appendLine("Faltan permiso USB, controlador SDR, sintonización y prueba de audio.")
        } else {
            report.appendLine("No se ha detectado un RTL-SDR de los identificadores conocidos.")
            report.appendLine("Esto NO descarta otros receptores USB compatibles.")
        }
        report.appendLine()
        report.appendLine("Receptor FM interno: NO VERIFICABLE mediante API pública universal de Android.")
        report.appendLine("La presencia de una antena, auriculares o app Radio no demuestra acceso al chip.")
        report.appendLine("Resultado global: diagnóstico parcial, nunca 100 % compatible sin una recepción de prueba.")
        report.appendLine("No se usa Internet ni se envían datos.")
        result.text = report.toString()
    }
}
