/**
 * Abarrotes María — Print Agent v1.0.0
 *
 * Servidor HTTP local que recibe tickets ESC/POS desde el navegador
 * y los envía a la impresora (USB, COM o red TCP).
 *
 * Uso:
 *   print-agent.exe              → arranca el servidor
 *   print-agent.exe install      → instala como servicio de Windows
 *   print-agent.exe uninstall    → elimina el servicio de Windows
 *
 * Configuración → print-agent.config.json en la misma carpeta que el .exe
 */

'use strict';

const http   = require('http');
const fs     = require('fs');
const net    = require('net');
const path   = require('path');
const { execSync } = require('child_process');

const VERSION = '1.0.0';
const SVC_NAME = 'AbarrotesPrintAgent';

// ── Configuración ─────────────────────────────────────────────────────────────

const exeDir    = path.dirname(process.execPath);
const configFile = path.join(exeDir, 'print-agent.config.json');

const config = {
  httpPort:       8183,
  printerTarget:  'USB001',   // USB001 | COM3 | 192.168.1.100:9100
};

try {
  if (fs.existsSync(configFile)) {
    Object.assign(config, JSON.parse(fs.readFileSync(configFile, 'utf8')));
    console.log(`Config cargada: ${configFile}`);
  }
} catch (e) {
  console.warn(`No se pudo leer ${configFile}: ${e.message}`);
}

// ── Comandos de servicio Windows ──────────────────────────────────────────────

const cmd = process.argv[2];

if (cmd === 'install') {
  const exe = `"${process.execPath}"`;
  try {
    execSync(`sc create "${SVC_NAME}" binPath= ${exe} start= auto DisplayName= "Abarrotes Print Agent"`);
    execSync(`sc description "${SVC_NAME}" "Agente de impresion para Abarrotes Maria POS"`);
    execSync(`sc start "${SVC_NAME}"`);
    console.log('');
    console.log('  Servicio instalado y arrancado correctamente.');
    console.log(`  Nombre: ${SVC_NAME}`);
    console.log('  Arranca automáticamente con Windows.');
    console.log('');
  } catch (e) {
    console.error('Error al instalar el servicio:', e.message);
    console.error('Asegúrate de ejecutar como Administrador.');
    process.exit(1);
  }
  process.exit(0);
}

if (cmd === 'uninstall') {
  try {
    try { execSync(`sc stop "${SVC_NAME}"`); } catch {}
    setTimeout(() => {
      execSync(`sc delete "${SVC_NAME}"`);
      console.log('Servicio eliminado correctamente.');
      process.exit(0);
    }, 2000);
  } catch (e) {
    console.error('Error al eliminar el servicio:', e.message);
    process.exit(1);
  }
  return;
}

// ── Impresión ─────────────────────────────────────────────────────────────────

/**
 * Envía bytes ESC/POS a la impresora configurada.
 * Soporta:
 *   - Puerto USB/COM local:  USB001 | LPT1 | COM3
 *   - Impresora en red TCP:  192.168.1.100:9100
 */
function printBytes(bytes) {
  const target = String(config.printerTarget || 'USB001').trim();

  if (target.includes(':')) {
    // Impresora en red vía TCP (rawport 9100)
    const [host, portStr] = target.split(':');
    const tcpPort = parseInt(portStr) || 9100;

    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port: tcpPort }, () => {
        socket.write(bytes, () => {
          socket.destroy();
          resolve();
        });
      });
      socket.setTimeout(8000, () => {
        socket.destroy();
        reject(new Error(`Timeout conectando a ${target}`));
      });
      socket.on('error', reject);
    });
  }

  // Puerto local (USB, COM, LPT)
  fs.writeFileSync(`\\\\.\\${target}`, bytes);
  return Promise.resolve();
}

// ── Servidor HTTP ─────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function send(res, status, body) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /ping — health check
  if (req.method === 'GET' && req.url === '/ping') {
    send(res, 200, { ok: true, version: VERSION, target: config.printerTarget });
    return;
  }

  // POST /print — imprimir ticket
  if (req.method === 'POST' && req.url === '/print') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { data } = JSON.parse(body);
        if (!data) throw new Error('Falta el campo "data" (base64).');

        const bytes = Buffer.from(data, 'base64');
        await printBytes(bytes);
        send(res, 200, { ok: true });
      } catch (e) {
        console.error('Error al imprimir:', e.message);
        send(res, 500, { error: e.message });
      }
    });
    req.on('error', (e) => send(res, 400, { error: e.message }));
    return;
  }

  send(res, 404, { error: 'Ruta no encontrada.' });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`El puerto ${config.httpPort} ya está en uso.`);
    console.error('Cambia "httpPort" en print-agent.config.json o cierra el proceso que lo usa.');
  } else {
    console.error('Error del servidor:', e.message);
  }
  process.exit(1);
});

server.listen(config.httpPort, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log(`  ║  Abarrotes María — Print Agent ${VERSION}  ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  Puerto HTTP  : ${config.httpPort}`);
  console.log(`  Impresora    : ${config.printerTarget}`);
  console.log('');
  console.log('  Para instalar como servicio de Windows:');
  console.log('    print-agent.exe install   (ejecutar como Administrador)');
  console.log('');
  console.log('  Agente listo. No cierres esta ventana.');
  console.log('');
});
