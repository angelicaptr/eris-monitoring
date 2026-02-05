<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .header {
            background-color: #ef4444;
            color: white;
            padding: 15px;
            border-radius: 5px 5px 0 0;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9fafb;
        }

        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }

        .label {
            font-weight: bold;
            color: #555;
        }

        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 13px;
            margin-top: 5px;
        }

        .btn {
            display: inline-block;
            background-color: #ef4444;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>⚠️ CRITICAL ALERT DETECTED</h2>
        </div>
        <div class="content">
            <p>Sistem mendeteksi error dengan tingkat <strong>CRITICAL</strong> pada aplikasi
                <strong>{{ $log->application->app_name }}</strong>.</p>

            <p>
                <span class="label">Waktu Kejadian:</span><br>
                {{ $log->created_at->format('d M Y H:i:s') }}
            </p>

            <p>
                <span class="label">Pesan Error:</span><br>
                {{ $log->message }}
            </p>

            <div class="label">Stack Trace (Preview):</div>
            <div class="code-block">
                {{ Str::limit($log->stack_trace, 500) }}
            </div>

            <center>
                <a href="{{ url('/?error_id=' . $log->id) }}" class="btn">Lihat Detail di Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>Email ini dikirim otomatis oleh System Log Monitor.</p>
        </div>
    </div>
</body>

</html>