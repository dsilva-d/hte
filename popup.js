const btn = document.getElementById("toggle")

btn.onclick = async () => {
  const data = await chrome.storage.local.get("enabled")

  const enabled = !data.enabled

  await chrome.storage.local.set({enabled})

  btn.innerText = enabled ? "Disable Hawk Tuah" : "Enable Hawk Tuah"
}