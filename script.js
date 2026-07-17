document.addEventListener("DOMContentLoaded", function () {
    // --- INTRO ---
    const bootScreen = document.getElementById("boot-screen");
    const bootText = document.getElementById("boot-text");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (bootScreen && bootText) {
        const introLines = [
            "Initializing portfolio...",
            "Loading information systems work...",
            "Indexing databases and code...",
            "Opening visual archive...",
            "System ready. Welcome."
        ];

        if (reduceMotion) {
            bootScreen.remove();
        } else {
            introLines.forEach((line, index) => {
                window.setTimeout(() => {
                    bootText.innerHTML += `${line}<br>`;
                    if (index === introLines.length - 1) {
                        window.setTimeout(() => {
                            bootScreen.classList.add("is-hidden");
                            window.setTimeout(() => bootScreen.remove(), 700);
                        }, 650);
                    }
                }, index * 290);
            });
        }
    }
    
    // --- 1. LANGUAGE DICTIONARY ---
    const translations = {
        en: {
            nav_home: "Home", nav_edu: "Education", nav_competence: "Competence", nav_certs: "Certs", nav_projects: "Projects", nav_contact: "Contact", nav_resume: "Resume",
            
            // UPDATED BIO (General Foundation + Apprenticeship Focus)
            hero_badge: "Information Systems & Databases Student.",
            hero_title: "Future Database Engineer.",
            hero_desc: "An Information Systems engineering student with solid knowledge in database design, SQL development, and information system modeling. Experienced in working with relational databases, data normalization, with a strong interest in building efficient, secure, and scalable data-driven applications.",
            
            btn_view_project: "View Projects",
            btn_contact: "Contact Me",
            section_edu: "Education Path",
            
            // ISTA
            edu_ista_title: "Computer Systems & Networks",
            edu_ista_date: "Sept 2024 - June 2026",
            edu_ista_desc: "Comprehensive training in network architecture, system administration, and infrastructure management.",
            // Fac
            
            // Bac
            edu_bac_title: "College Diploma - Physics",
            edu_bac_desc: "Focus on Physics and Mathematics.",
            
            section_competence: "Competence",
            skill_net: "Networking", skill_sys: "SysAdmin", skill_cloud: "Cloud & Sec",
            
            // Language Card
            skill_lang: "Languages",
            lang_ar: "Arabic", level_native: "Native",
            lang_en: "English", level_c1: "Advanced (C1)",
            
            lang_fr: "French", level_b2: "Intermediate (B1-B2)",

            section_certs: "Certifications",
            status_earned: "Earned", status_progress: "In Progress",
            
            section_projects: "Featured Projects",
            proj_1_title: "Secure Azure Cloud Network", proj_1_desc: "A complex Azure implementation featuring pfSense, Suricata IPS, and Active Directory.",
            proj_2_title: "Network Automation", proj_2_desc: "Python scripts for automating device configuration and network discovery.",
            btn_details: "View Details",
            
            section_contact: "Let's Connect",
            contact_desc: "I am currently looking for internship and apprenticeship opportunities.",
            btn_send: "Send Message"
        },
        de: {
            nav_home: "Startseite", nav_edu: "Bildung", nav_competence: "Kompetenzen", nav_certs: "Zertifikate", nav_projects: "Projekte", nav_contact: "Kontakt", nav_resume: "Lebenslauf",
            
            // UPDATED BIO (German)
            hero_badge: "Netzwerk & Systeme Student",
            hero_title: "Zukünftiger Admin.",
            hero_desc: "Ein 20-jähriger angehender Fachinformatiker für Systemintegration mit fundiertem Basiswissen in Computersystemen und fortgeschrittener Netzwerktechnik. Mit praktischer Erfahrung in Virtualisierung und Netzwerkarchitektur sowie hoher Lernbereitschaft strebe ich eine professionelle Ausbildung in Deutschland an.",
            
            btn_view_project: "Projekte ansehen",
            btn_contact: "Kontaktieren Sie mich",
            section_edu: "Bildungsweg",
            // ISTA
            edu_ista_title: "Computersysteme und Netzwerke",
            edu_ista_date: "Sept 2024 - Juni 2026",
            edu_ista_desc: "Umfassende Ausbildung in Netzwerkarchitektur, Systemadministration und Infrastrukturmanagement.",
            // Fac
            edu_bio_title: "Biologiestudium",
            edu_bio_date: "Sept 2023 - Juli 2024",
            edu_bio_desc: "Entwicklung von wissenschaftlichem Denken und analytischen Fähigkeiten.",
            // Bac
            edu_bac_title: "Abitur Physik",
            edu_bac_desc: "Schwerpunkt Physik und Mathematik.",
            
            section_competence: "Kompetenzen",
            skill_net: "Netzwerke", skill_sys: "SysAdmin", skill_cloud: "Cloud & Sicherheit",
            
            // Language Card
            skill_lang: "Sprachen",
            lang_ar: "Arabisch", level_native: "Muttersprache",
            lang_en: "Englisch", level_c1: "Fortgeschritten (C1)",
            lang_de: "Deutsch", level_a2: "Anfänger (A2)",
            lang_fr: "Französisch", level_b2: "Mittelstufe (B2)",

            section_certs: "Zertifizierungen",
            status_earned: "Erhalten", status_progress: "In Bearbeitung",
            
            section_projects: "Ausgewählte Projekte",
            proj_1_title: "Sicheres Azure Cloud Netzwerk", proj_1_desc: "Eine komplexe Azure-Implementierung mit pfSense, Suricata IPS und Active Directory.",
            proj_2_title: "Netzwerkautomatisierung", proj_2_desc: "Python-Skripte zur Automatisierung der Gerätekonfiguration.",
            btn_details: "Details anzeigen",
            
            section_contact: "Lassen Sie uns verbinden",
            contact_desc: "Ich suche derzeit nach Praktikums- und Ausbildungsplätzen.",
            btn_send: "Nachricht Senden"
        },
        fr: {
            nav_home: "Accueil", nav_edu: "Éducation", nav_competence: "Compétences", nav_certs: "Certs", nav_projects: "Projets", nav_contact: "Contact", nav_resume: "CV",
            
            // UPDATED BIO (French)
            hero_badge: "Étudiant Réseaux & Systèmes",
            hero_title: "Futur Admin.",
            hero_desc: "Un futur spécialiste informatique de 20 ans en intégration de systèmes, avec une base technique solide en systèmes informatiques et réseaux avancés. Alliant une expérience pratique de la virtualisation et de l'architecture réseau à une forte éthique de travail, je suis désireux de débuter un apprentissage professionnel en Allemagne.",
            
            btn_view_project: "Voir Projets",
            btn_contact: "Contactez-moi",
            section_edu: "Parcours Éducatif",
            // ISTA
            edu_ista_title: "Systèmes et Réseaux Informatiques",
            edu_ista_date: "Sept 2024 - Juin 2026",
            edu_ista_desc: "Formation complète en architecture réseau, administration système et gestion d'infrastructure.",
            // Fac
            edu_bio_title: "Études de Biologie",
            edu_bio_date: "Sept 2023 - Juil 2024",
            edu_bio_desc: "Développement du raisonnement scientifique, protocoles de labo et esprit analytique.",
            // Bac
            edu_bac_title: "Baccalauréat Sciences Physiques",
            edu_bac_desc: "Concentration sur la physique et les mathématiques.",
            
            section_competence: "Compétences",
            skill_net: "Réseaux", skill_sys: "Admin Sys", skill_cloud: "Cloud & Sécu",
            
            // Language Card
            skill_lang: "Langues",
            lang_ar: "Arabe", level_native: "Langue Maternelle",
            lang_en: "Anglais", level_c1: "Avancé (C1)",
            lang_de: "Allemand", level_a2: "Débutant (A2)",
            lang_fr: "Français", level_b2: "Intermédiaire (B2)",

            section_certs: "Certifications",
            status_earned: "Obtenu", status_progress: "En Cours",
            
            section_projects: "Projets Phares",
            proj_1_title: "Réseau Cloud Azure Sécurisé", proj_1_desc: "Une implémentation Azure complexe avec pfSense, Suricata IPS et Active Directory.",
            proj_2_title: "Automatisation Réseau", proj_2_desc: "Scripts Python pour automatiser la configuration des appareils.",
            btn_details: "Voir Détails",
            
            section_contact: "Connectons-nous",
            contact_desc: "Je suis actuellement à la recherche d'opportunités de stage et d'apprentissage.",
            btn_send: "Envoyer Message"
        }
    };

    // Keep the visible English/French switch aligned with this portfolio's content.
    Object.assign(translations.en, {
        nav_certs: "Degree",
        hero_badge: "Information Systems & Databases Student",
        hero_title: "Future Information Systems Engineer.",
        hero_desc: "Information Systems engineering student focused on database design, system analysis, and software development. Strong foundation in SQL, data modeling, algorithms, and structured application development.",
        section_certs: "Degree"
    });
    Object.assign(translations.fr, {
        nav_home: "Accueil",
        nav_edu: "\u00c9ducation",
        nav_competence: "Comp\u00e9tences",
        nav_certs: "Dipl\u00f4me",
        nav_projects: "Projets",
        hero_badge: "\u00c9tudiant en syst\u00e8mes d'information et bases de donn\u00e9es",
        hero_title: "Futur ing\u00e9nieur en syst\u00e8mes d'information.",
        hero_desc: "\u00c9tudiant en ing\u00e9nierie des syst\u00e8mes d'information, orient\u00e9 vers la conception de bases de donn\u00e9es, l'analyse des syst\u00e8mes et le d\u00e9veloppement logiciel.",
        section_certs: "Dipl\u00f4me",
        section_projects: "Projets"
    });
    
    // Dynamic List Content for ISTA
    const istaLists = {
        en: `<li><strong>Networking:</strong> VLANs, OSPF, BGP, STP, IPv6, WLAN, VoIP.</li>
             <li><strong>SysAdmin:</strong> Windows Server (AD, DNS, GPO), Linux Admin.</li>
             <li><strong>Cloud & Automation:</strong> Azure, SDN, Python, Network Security.</li>`,
        fr: `<li><strong>Réseaux:</strong> VLANs, OSPF, BGP, STP, IPv6, WLAN, VoIP.</li>
             <li><strong>Admin Sys:</strong> Windows Server (AD, DNS, GPO), Admin Linux.</li>
             <li><strong>Cloud & Auto:</strong> Azure, SDN, Python, Sécurité Réseau.</li>`,
        de: `<li><strong>Netzwerke:</strong> VLANs, OSPF, BGP, STP, IPv6, WLAN, VoIP.</li>
             <li><strong>SysAdmin:</strong> Windows Server (AD, DNS, GPO), Linux Admin.</li>
             <li><strong>Cloud & Auto:</strong> Azure, SDN, Python, Netzwerksicherheit.</li>`
    };

    // --- 2. LANGUAGE LOGIC ---
    let currentLang = 'en';

    window.setLanguage = function(lang) {
        currentLang = lang;
        
        // Update Buttons Styling
        document.querySelectorAll('.lang-opt').forEach(btn => btn.classList.remove('active'));
        if(document.getElementById(`btn-${lang}`)) {
            document.getElementById(`btn-${lang}`).classList.add('active');
        }

        // Update Static Text
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Update Dynamic HTML lists (ISTA)
        const istaListEl = document.querySelector('[data-i18n="edu_ista_list"]');
        if(istaListEl) istaListEl.innerHTML = istaLists[lang];
    };

    // Initial Lang Setup
    setLanguage('en');

    // --- 3. PROJECT DATA ---
    const config = {
        projects: {
            "project-modal-1": {
                currentSlide: 0,
                slides: [
                    // --- 1. TOPOLOGY ---
                    {
                        img: "images/0-topology.png",
                        title: { 
                            en: "1. Network Topology Overview", 
                            fr: "1. Vue d'Ensemble de la Topologie", 
                            de: "1. Netzwerk-Topologie Übersicht" 
                        },
                        text: {
                            en: "High-level diagram of the Azure infrastructure. It illustrates the Hub-and-Spoke model, where the central pfSense NVA filters traffic between the segregated subnets (Identity, VoIP, Web) and the Internet.",
                            fr: "Diagramme de haut niveau de l'infrastructure Azure. Il illustre le modèle Hub-and-Spoke, où le NVA pfSense central filtre le trafic entre les sous-réseaux isolés et Internet.",
                            de: "High-Level-Diagramm der Azure-Infrastruktur. Es veranschaulicht das Hub-and-Spoke-Modell, bei dem die zentrale pfSense NVA den Verkehr zwischen den Subnetzen filtert."
                        }
                    },
                    // --- 2. SUBNETS ---
                    {
                        img: "images/1-azure-subnets.png",
                        title: { en: "2. Cloud Segmentation", fr: "2. Segmentation Cloud", de: "2. Cloud-Segmentierung" },
                        text: {
                            en: "Implementation of the VNet (10.0.0.0/16) divided into strict subnets. Used Azure User Defined Routes (UDR) to force traffic through the appliance.",
                            fr: "Mise en œuvre du VNet divisé en sous-réseaux stricts. Utilisation des UDR pour forcer le trafic via l'appliance.",
                            de: "Implementierung des VNet in strikte Subnetze. Verwendung von UDR, um den Verkehr durch die Appliance zu leiten."
                        }
                    },
                    // --- 3. PFSENSE ---
                    {
                        img: "images/2-pfsense-dashboard.png",
                        title: { en: "3. Core Gateway (pfSense)", fr: "3. Passerelle Centrale", de: "3. Zentrales Gateway" },
                        text: {
                            en: "The pfSense dashboard showing active interfaces and status. It handles Firewall rules, NAT, and OpenVPN for secure remote access.",
                            fr: "Tableau de bord pfSense montrant les interfaces actives. Il gère le pare-feu, le NAT et OpenVPN.",
                            de: "Das pfSense-Dashboard zeigt aktive Schnittstellen. Es verarbeitet Firewall-Regeln, NAT und OpenVPN."
                        }
                    },
                    // --- 4. AD DS ---
                    {
                        img: "images/3-ad-dashboard.png",
                        title: { en: "4. Identity (Active Directory)", fr: "4. Identité (AD DS)", de: "4. Identität (AD DS)" },
                        text: {
                            en: "Windows Server Domain Controller managing 'projetpfe.local'. Handles Users, Computers, and internal DNS resolution.",
                            fr: "Contrôleur de domaine Windows Server gérant 'projetpfe.local'. Gère les utilisateurs et la résolution DNS interne.",
                            de: "Windows Server Domänencontroller für 'projetpfe.local'. Verwaltet Benutzer und interne DNS-Auflösung."
                        }
                    },
                    // --- 5. HAPROXY ---
                    {
                        img: "images/4-haproxy-stats.png",
                        title: { en: "5. Reverse Proxy (HAProxy)", fr: "5. Proxy Inverse", de: "5. Reverse Proxy" },
                        text: {
                            en: "HAProxy status page on pfSense. It securely publishes the internal Nginx web server to the internet using Layer 7 load balancing.",
                            fr: "Page de statut HAProxy sur pfSense. Publie le serveur web Nginx interne sur Internet via l'équilibrage de charge de couche 7.",
                            de: "HAProxy-Statusseite auf pfSense. Veröffentlicht den internen Nginx-Webserver sicher im Internet."
                        }
                    },
                    // --- 6. VOIP ---
                    {
                        img: "images/5-voip-call.png",
                        title: { en: "6. VoIP Call Test", fr: "6. Test d'Appel VoIP", de: "6. VoIP-Anruftest" },
                        text: {
                            en: "Successful SIP call test using Zoiper softphones connected to the Asterisk PBX. Verifies that RTP ports and NAT rules are correctly configured.",
                            fr: "Test d'appel SIP réussi avec Zoiper connecté au PBX Asterisk. Vérifie que les ports RTP et le NAT sont corrects.",
                            de: "Erfolgreicher SIP-Anruftest mit Zoiper. Bestätigt, dass RTP-Ports und NAT-Regeln korrekt konfiguriert sind."
                        }
                    },
                    // --- 7. SURICATA ---
                    {
                        img: "images/6-suricata-alerts.png",
                        title: { en: "7. IDS/IPS Defense", fr: "7. Défense IDS/IPS", de: "7. IDS/IPS-Verteidigung" },
                        text: {
                            en: "Suricata logs showing detection of an Nmap scan. The system identified the attack signature and blocked the source IP immediately.",
                            fr: "Logs Suricata montrant la détection d'un scan Nmap. Le système a identifié la signature et bloqué l'IP source.",
                            de: "Suricata-Protokolle zeigen die Erkennung eines Nmap-Scans. Das System blockierte die Quell-IP sofort."
                        }
                    },
                    // --- 8. WAZUH ---
                    {
                        img: "images/7-wazuh-dashboard.png",
                        title: { en: "8. SIEM (Wazuh)", fr: "8. SIEM (Wazuh)", de: "8. SIEM (Wazuh)" },
                        text: {
                            en: "Wazuh Security Dashboard aggregating logs from all endpoints to detect vulnerabilities, configuration issues, and file integrity changes.",
                            fr: "Tableau de bord de sécurité Wazuh agrégeant les logs pour détecter les vulnérabilités et les changements d'intégrité des fichiers.",
                            de: "Wazuh-Sicherheits-Dashboard, das Protokolle aggregiert, um Schwachstellen und Dateiintegritätsänderungen zu erkennen."
                        }
                    },
                    // --- 9. ZABBIX ---
                    {
                        img: "images/8-zabbix-dashboard.png",
                        title: { en: "9. Monitoring (Zabbix)", fr: "9. Supervision (Zabbix)", de: "9. Überwachung (Zabbix)" },
                        text: {
                            en: "Zabbix dashboard monitoring the health of the entire stack (Linux/Windows). It tracks CPU, RAM, and service uptime (Apache, Asterisk).",
                            fr: "Tableau de bord Zabbix surveillant la santé de l'infrastructure. Il suit le CPU, la RAM et la disponibilité des services.",
                            de: "Zabbix-Dashboard zur Überwachung der Integrität des Stacks (CPU, RAM, Dienste)."
                        }
                    }
                ]
            },
            "project-modal-2": {
                currentSlide: 0,
                slides: [
                    {
                        img: "https://via.placeholder.com/800x400?text=Python+Automation",
                        title: { en: "Network Automation", fr: "Automatisation Réseau", de: "Netzwerkautomatisierung" },
                        text: {
                            en: "Python scripts to automate device configuration backups via SSH and perform network discovery.",
                            fr: "Scripts Python pour automatiser les sauvegardes de configuration via SSH et la découverte réseau.",
                            de: "Python-Skripte zur Automatisierung von Konfigurationssicherungen über SSH und Netzwerkerkennung."
                        }
                    }
                ]
            }
        }
    };

    // --- 4. INITIALIZATION ---
    AOS.init({ duration: 1000, once: true });
    
    // --- 5. MOBILE NAV ---
    const mobileMenuBtn = document.querySelector(".mobile-menu-icon");
    const mobileNav = document.getElementById("mobile-nav");
    const closeMobileBtn = document.querySelector(".close-mobile-nav");

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => mobileNav.classList.add("active"));
        closeMobileBtn.addEventListener("click", () => mobileNav.classList.remove("active"));
    }

    // --- 6. MODALS ---
    const allModals = document.querySelectorAll(".modal");
    const imageModal = document.getElementById("image-modal");

    function openModal(modal) {
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }

    function closeModal(modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    document.querySelectorAll(".open-project-modal-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const modalId = this.closest(".project-card").dataset.modalId;
            const modal = document.getElementById(modalId);
            if(config.projects[modalId]) {
                config.projects[modalId].currentSlide = 0;
                updateModalSlide(modalId);
            }
            openModal(modal);
        });
    });

    allModals.forEach(modal => {
        const closeBtn = modal.querySelector(".close-button");
        if(closeBtn) closeBtn.addEventListener("click", () => closeModal(modal));
        modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modal); });
    });

    function updateModalSlide(modalId) {
        const projectData = config.projects[modalId];
        const modal = document.getElementById(modalId);
        const currentData = projectData.slides[projectData.currentSlide];
        
        const imgContainer = modal.querySelector(".project-modal-image-wrapper");
        const descContainer = modal.querySelector(".project-modal-description");
        const counter = modal.querySelector(".project-modal-counter");

        const title = currentData.title[currentLang];
        const text = currentData.text[currentLang];

        imgContainer.innerHTML = `<img src="${currentData.img}" alt="${title}">`;
        descContainer.innerHTML = `<h4>${title}</h4><p>${text}</p>`;
        if(counter) counter.textContent = `${projectData.currentSlide + 1} / ${projectData.slides.length}`;
        
        imgContainer.querySelector("img").addEventListener("click", () => {
             const zoomImg = imageModal.querySelector("img");
             if(zoomImg) {
                 zoomImg.src = currentData.img;
                 openModal(imageModal);
             }
        });
    }

    document.querySelectorAll(".project-modal").forEach(modal => {
        const modalId = modal.id;
        const nextBtn = modal.querySelector(".next");
        const prevBtn = modal.querySelector(".prev");

        if(nextBtn) nextBtn.addEventListener("click", () => {
            const proj = config.projects[modalId];
            proj.currentSlide = (proj.currentSlide + 1) % proj.slides.length;
            updateModalSlide(modalId);
        });
        if(prevBtn) prevBtn.addEventListener("click", () => {
            const proj = config.projects[modalId];
            proj.currentSlide = (proj.currentSlide - 1 + proj.slides.length) % proj.slides.length;
            updateModalSlide(modalId);
        });
    });

   // --- FORM SUBMISSION (AJAX for Formspree) ---
    const form = document.getElementById("contact-form");
    
    if(form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault(); // Stop the default page reload
            
            const btn = form.querySelector(".submit-btn");
            const originalText = btn.innerHTML;

            // 1. Show Loading State
            btn.innerHTML = "Sending... <i class='bx bx-loader-alt bx-spin'></i>";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            const formData = new FormData(form);

            try {
                // 2. Send Data to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                // 3. Handle Success
                if (response.ok) {
                    btn.innerHTML = "Message Sent! <i class='bx bx-check'></i>";
                    btn.style.background = "#2ecc71"; // Green color
                    btn.style.color = "#fff";
                    form.reset(); // Clear input fields

                    // Revert button after 4 seconds
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = ""; // Revert to CSS default
                        btn.style.color = "";
                        btn.style.opacity = "1";
                        btn.disabled = false;
                    }, 4000);
                } else {
                    // Handle Server-side validation errors
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        throw new Error("Server Error");
                    }
                    throw new Error("Submission Failed");
                }
            } catch (error) {
                // 4. Handle Network Errors
                console.error("Error:", error);
                btn.innerHTML = "Failed. Try Again.";
                btn.style.background = "#e74c3c"; // Red color
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = "";
                    btn.style.opacity = "1";
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
});

