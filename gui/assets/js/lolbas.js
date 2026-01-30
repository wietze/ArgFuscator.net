document.addEventListener("DOMContentLoaded", () => {

    let toFind = document.querySelector('section>h1').innerText.toLowerCase();
    if (toFind) {
        try {
            fetch('https://lolbas-project.github.io/api/lolbas.json')
                .then(x => x.json())
                .then(x => x.filter(y => y.Name.toLowerCase() == `${toFind.replace('.exe', '')}.exe`))
                .then(x => { if (x.length > 0) { let command_count = x[0].Commands.length; a = document.createElement("a"); a.classList.add("button"); a.href = x[0].url; a.target = "_blank"; a.innerText = `↗️ LOLBAS Project (${command_count})`; document.getElementById("related-links").appendChild(a); } })
                .catch(e => console.error(`Could not connect to the LOLBAS project: ${e}`))
        } catch {
            console.warn("Could not connect to the LOLBAS project.")
        }

        try {
            fetch('https://gtfobins.org/api.json')
                .then(x => x.json())
                .then(x => Object.keys(x['executables']))
                .then(x => x.filter(y => y == toFind))
                .then(x => { if (x.length > 0) { a = document.createElement("a"); a.classList.add("button"); a.href = `https://gtfobins.org/gtfobins/${x}/`; a.target = "_blank"; a.innerText = `↗️ GTFOBins Project`; document.getElementById("related-links").appendChild(a); } })
                .catch(e => console.error(`Could not connect to the GTFOBins project: ${e}`))
        } catch {
            console.warn("Could not connect to the GTFOBins project.")
        }

        try {
            fetch('https://raw.githubusercontent.com/infosecB/LOOBins/refs/heads/main/src/loobins_stix.json') // normal API has CORS issues
                .then(x => x.json())
                .then(x => x['objects'])
                .then(x => x.filter(y => y['name'].toLowerCase() == toFind.toLowerCase()))
                .then(x => { if (x.length > 0) { a = document.createElement("a"); a.classList.add("button"); a.href = `https://www.loobins.io/binaries/${x[0]['name']}/`; a.target = "_blank"; a.innerText = `↗️ LOOBins Project`; document.getElementById("related-links").appendChild(a); } })
                .catch(e => console.error(`Could not connect to the LOOBins project: ${e}`))
        } catch {
            console.warn("Could not connect to the LOOBins project.")
        }
    }
}, false);
