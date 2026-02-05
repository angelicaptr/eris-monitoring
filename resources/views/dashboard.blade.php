<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Log Monitor Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            color: #343a40;
        }
        .sidebar {
            height: 100vh;
            background-color: #007bff;
            color: white;
        }
        .sidebar a {
            color: white;
        }
        .sidebar a:hover {
            background-color: #0056b3;
        }
        .content {
            margin-left: 250px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="d-flex">
        <div class="sidebar p-3">
            <h4>Dashboard</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#">Ringkasan Utama</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Laporan Mingguan</a>
                </li>
            </ul>
            <h4>Manajemen Log</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#">Semua Log Error</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Log Kritikal</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Log Selesai</a>
                </li>
            </ul>
            <h4>Monitoring Real-Time</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#">Live Stream Log</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Tren Error Aplikasi</a>
                </li>
            </ul>
            <h4>Manajemen Aplikasi</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#">Aplikasi Terdaftar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Tambah Aplikasi</a>
                </li>
            </ul>
            <h4>Pengaturan</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="#">Profil Pengguna</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Konfigurasi Email</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Dokumentasi API</a>
                </li>
            </ul>
        </div>
        <div class="content">
            <h1>Welcome to the Error Log Monitor Dashboard</h1>
            <p>This is the main content area.</p>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>