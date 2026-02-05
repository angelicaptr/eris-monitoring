$apiKey = "a8dTNhuWJRd6AeeGjswaT55FJl5fRcyld"
$url = "http://log-monitor.test/api/logs"

$body = @{
    message = "Something went wrong (error)"
    severity = "critical"
    api_key = $apiKey
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response received:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
    
    if ($response.data.severity -eq "critical") {
        Write-Host "SUCCESS: Severity is critical" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Severity is $($response.data.severity)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Response.GetDataStream()
}
