$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

function Invoke-Gh {
  param([string[]]$Arguments)
  $result = & gh @Arguments
  if ($LASTEXITCODE -ne 0) { throw "GitHub command failed: gh $($Arguments -join ' ')" }
  return $result
}

function Invoke-Probe {
  param([string]$Command, [string[]]$Arguments)
  $ErrorActionPreference = 'SilentlyContinue'
  $output = & $Command @Arguments 2>$null
  return @{ ExitCode = $LASTEXITCODE; Output = ($output | Out-String).Trim() }
}

& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Sign in with gh auth login, then run this script again.' }
$account = (Invoke-Gh -Arguments @('api', 'user', '--jq', '.login')).Trim()
if ($account.ToLowerInvariant() -ne 'draexon') { throw "Signed in as $account. Sign in as draexon before publishing." }

$repo = 'draexon/pros'
$existing = Invoke-Probe -Command 'gh' -Arguments @('repo', 'view', $repo, '--json', 'visibility', '--jq', '.visibility')
if ($existing.ExitCode -ne 0) {
  Invoke-Gh -Arguments @('repo', 'create', $repo, '--private', '--description', 'Original monochrome React components, made to move. By draexon.') | Out-Host
} elseif ($existing.Output -ne 'PRIVATE') {
  throw 'The existing repository is not private. Nothing was pushed.'
}
$visibility = (Invoke-Gh -Arguments @('repo', 'view', $repo, '--json', 'visibility', '--jq', '.visibility')).Trim()
if ($visibility -ne 'PRIVATE') { throw 'Private visibility could not be verified. Nothing was pushed.' }

$author = (& git log -1 --format=%an).Trim()
if ($LASTEXITCODE -ne 0 -or $author -ne 'draexon') { throw 'The current commit must be authored by draexon.' }

$origin = Invoke-Probe -Command 'git' -Arguments @('remote', 'get-url', 'origin')
if ($origin.ExitCode -eq 0) {
  if ($origin.Output -notmatch '^https://github\.com/draexon/pros(?:\.git)?$' -and $origin.Output -notmatch '^git@github\.com:draexon/pros(?:\.git)?$') {
    throw "Origin points to $($origin.Output). Nothing was changed or pushed."
  }
} else {
  & git remote add origin 'https://github.com/draexon/pros.git'
  if ($LASTEXITCODE -ne 0) { throw 'Could not add the repository remote.' }
}

Invoke-Gh -Arguments @('auth', 'setup-git') | Out-Host
& git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. No force push was attempted.' }
Invoke-Gh -Arguments @('repo', 'view', $repo, '--json', 'url,visibility') | Out-Host
