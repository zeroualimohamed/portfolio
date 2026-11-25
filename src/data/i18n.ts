export type Lang = "en" | "fr";

export interface CopyDict {
  skip: string;
  navEducation: string;
  navStack: string;
  navProjects: string;
  navArchive: string;
  navAbout: string;
  navContact: string;
  ctaHeader: string;
  monsterPing: string;
  menuOpen: string;
  menuClose: string;

  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroBio: string;
  heroCtaWork: string;
  heroCtaArchive: string;
  stat1Val: string;
  stat1Label: string;
  stat2Val: string;
  stat2Label: string;
  stat3Val: string;
  stat3Label: string;

  eduKicker: string;
  eduTitle: string;
  eduSub: string;
  edu1Date: string;
  edu1Badge: string;
  edu1School: string;
  edu1Degree: string;
  edu1Desc: string;
  edu2Date: string;
  edu2Badge: string;
  edu2School: string;
  edu2Degree: string;
  edu2Desc: string;
  edu3Date: string;
  edu3Badge: string;
  edu3School: string;
  edu3Degree: string;
  edu3Desc: string;

  stackKicker: string;
  stackTitle: string;
  stackSub: string;
  stackHint: string;
  gDatabases: string;
  gProgramming: string;
  gSystems: string;
  gAi: string;
  gVisual: string;

  projKicker: string;
  projTitle: string;
  projSub: string;
  p1Status: string;
  p1Title: string;
  p1Desc: string;
  p1Note: string;
  p2Status: string;
  p2Title: string;
  p2Desc: string;
  p2Cta: string;

  archKicker: string;
  archTitle: string;
  archSub: string;
  archVibeHint: string;
  archResetVibe: string;
  modeStack: string;
  modePortals: string;
  filterAll: string;
  filterLandscape: string;
  filterPortrait: string;
  filterSquare: string;
  deckPrev: string;
  deckNext: string;
  deckInspect: string;
  deckHint: string;

  aboutKicker: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutMetaSchool: string;
  aboutMetaTrack: string;
  aboutMetaLang: string;
  aboutMetaArt: string;
  offCodeTitle: string;
  offCodeSub: string;
  offCodeCard1Title: string;
  offCodeCard1Desc: string;
  offCodeCard2Title: string;
  offCodeCard2Desc: string;

  contactKicker: string;
  contactTitle: string;
  contactSub: string;
  ctEmail: string;
  ctEmailSub: string;
  ctLi: string;
  ctGh: string;
  likeTitle: string;
  likeDesc: string;
  likeCountLabel: string;
  formTitle: string;
  fName: string;
  fEmail: string;
  fMessage: string;
  phName: string;
  phEmail: string;
  phMessage: string;
  fSend: string;
  fSending: string;
  errRequired: string;
  errEmail: string;
  fFix: string;
  fMailto: string;
  fReadyNote: string;
  fSent: string;
  fFail: string;

  ftRights: string;
  ftTop: string;

  lbClose: string;
  lbPrev: string;
  lbNext: string;
  lbZoom: string;
  lbFit: string;
  lbDialog: string;
}

export const COPY: Record<Lang, CopyDict> = {
  en: {
    skip: "Skip to content",
    navEducation: "Education",
    navStack: "Stack",
    navProjects: "Projects",
    navArchive: "2D & 3D",
    navAbout: "About",
    navContact: "Contact",
    ctaHeader: "Get in touch",
    monsterPing: "Ping the background creature",
    menuOpen: "Open menu",
    menuClose: "Close menu",

    heroKicker: "MOHAMED ZEROUALI · 4IIRF ENGINEERING STUDENT",
    heroTitleLine1: "Systems, data,",
    heroTitleLine2: "and dark worlds.",
    heroBio:
      "4th-year Computer & Network Engineering student (4IIRF) at EMSI Fès, specializing in Cybersecurity in Semester 2, with a completed Licence in Information Systems & Databases from Faculté Polydisciplinaire de Taza. Strong foundation in SQL, relational modeling, and software development, currently building a major Machine Learning project alongside 2D/3D visual art.",
    heroCtaWork: "Explore projects",
    heroCtaArchive: "2D & 3D breach (21)",
    stat1Val: "4IIRF",
    stat1Label: "EMSI Fès · Cybersecurity S2",
    stat2Val: "LICENCE",
    stat2Label: "FP Taza · Earned 2026",
    stat3Val: "21 WORKS",
    stat3Label: "Photoshop & Blender 3D",

    eduKicker: "EDUCATION & DEGREE",
    eduTitle: "Where I studied",
    eduSub: "Licence completed in Taza, now advancing in engineering at EMSI Fès.",
    edu1Date: "2026 - PRESENT",
    edu1Badge: "IN PROGRESS",
    edu1School: "EMSI Fès",
    edu1Degree: "4th Year Engineering (4IIRF)",
    edu1Desc:
      "Computer & Network Engineering cycle (Ingénierie Informatique et Réseaux), heading into the Cybersecurity specialization in Semester 2 while building a major Machine Learning project.",
    edu2Date: "2023 - 2026",
    edu2Badge: "EARNED",
    edu2School: "Faculté Polydisciplinaire de Taza",
    edu2Degree: "Licence in Information Systems & Databases",
    edu2Desc:
      "Completed degree covering relational databases, information systems analysis, programming, operating systems, and structured software development.",
    edu3Date: "2023",
    edu3Badge: "EARNED",
    edu3School: "High School",
    edu3Degree: "Baccalaureate - Physical Sciences",
    edu3Desc: "Focus on Physics and Mathematics.",

    stackKicker: "TECH STACK",
    stackTitle: "What I build with",
    stackSub: "Hover any chip or type on your keyboard to drive the ASCII workstation.",
    stackHint: "Interactive ASCII workstation · type keys or hover skills",
    gDatabases: "Databases",
    gProgramming: "Programming",
    gSystems: "Systems & Security",
    gAi: "Machine Learning",
    gVisual: "2D / 3D & Languages",

    projKicker: "PROJECTS",
    projTitle: "Through the breach",
    projSub: "Active engineering builds in Machine Learning, databases, and software systems.",
    p1Status: "ACTIVE BUILD",
    p1Title: "Machine Learning Project",
    p1Desc:
      "Currently developing a major Machine Learning project combining data engineering, model training, and real-world software integration. Full architecture notes and repository will be published once the core milestones wrap.",
    p1Note: "In active development · EMSI Fès 4IIRF",
    p2Status: "PUBLISHING SOON",
    p2Title: "Personal Database & Software Projects",
    p2Desc:
      "Relational database schemas (Oracle, PostgreSQL, MySQL, PL/SQL) and C/C++/Java/PHP engineering work being packaged for public release.",
    p2Cta: "Follow on GitHub",

    archKicker: "2D & 3D ARCHIVE · HELIOS",
    archTitle: "Visual breach",
    archSub:
      "Adobe Photoshop and Blender 3D compositions. Hovering any artwork shifts the entire site's lighting and ASCII creature to match its exact color vibe.",
    archVibeHint: "Hover or flip a work to control the site vibe",
    archResetVibe: "Reset vibe",
    modeStack: "Stack",
    modePortals: "Portals (21)",
    filterAll: "All",
    filterLandscape: "Landscape",
    filterPortrait: "Portrait",
    filterSquare: "Square",
    deckPrev: "Previous artwork",
    deckNext: "Next artwork",
    deckInspect: "Open full size",
    deckHint: "Drag left/right, click behind cards, or hover to change site vibe.",

    aboutKicker: "ABOUT",
    aboutTitle: "Code, security, and craft",
    aboutP1:
      "I bridge two worlds: structured engineering on the backend (relational databases, information systems, Machine Learning, and Cybersecurity) and dark cinematic visual direction in Blender 3D and Photoshop.",
    aboutP2:
      "After earning my Licence at Faculté Polydisciplinaire de Taza, I joined EMSI Fès in 4th year (4IIRF) to push deeper into software engineering and Cybersecurity in Semester 2.",
    aboutMetaSchool: "EMSI Fès (4IIRF) · Licence FP Taza",
    aboutMetaTrack: "Databases · Machine Learning · Cybersecurity (S2)",
    aboutMetaLang: "Arabic (Native) · French (B1 - B2) · English (B2 - C1)",
    aboutMetaArt: "Adobe Photoshop · Blender 3D (21 works)",
    offCodeTitle: "Off the code",
    offCodeSub: "What sharpens my eye outside compilers and SQL terminals.",
    offCodeCard1Title: "HELIOS / 3D Worlds",
    offCodeCard1Desc:
      "Dark fantasy environments, poster typography, and volumetric lighting studies built in Blender 3D and finished in Photoshop.",
    offCodeCard2Title: "Cybersecurity & ML Lab",
    offCodeCard2Desc:
      "Preparing for the Semester 2 Cybersecurity track while iterating on my current Machine Learning build.",

    contactKicker: "CONTACT",
    contactTitle: "Get in touch",
    contactSub: "Open to engineering internships, apprenticeships, and serious technical collaborations.",
    ctEmail: "Email Me",
    ctEmailSub: "Send via form or direct mail",
    ctLi: "LinkedIn",
    ctGh: "GitHub",
    likeTitle: "> like.exe",
    likeDesc: "Tap the ASCII heart. The creature keeps count.",
    likeCountLabel: "likes",
    formTitle: "Send a message",
    fName: "Name *",
    fEmail: "Email *",
    fMessage: "Message *",
    phName: "Your Name",
    phEmail: "your@email.com",
    phMessage: "Write your message here...",
    fSend: "Send",
    fSending: "Sending...",
    errRequired: "This field is required",
    errEmail: "Enter a valid email address",
    fFix: "Please fix the highlighted fields.",
    fMailto: "Opening your email app with the message ready to send.",
    fReadyNote: "Message validated. Reach out directly at mohamed.zeroualixxx@gmail.com.",
    fSent: "Message sent. I will get back to you soon.",
    fFail: "Could not send right now. Write directly to mohamed.zeroualixxx@gmail.com.",

    ftRights: "Mohamed Zerouali · EMSI Fès 4IIRF",
    ftTop: "Back to top",

    lbClose: "Close",
    lbPrev: "Previous work",
    lbNext: "Next work",
    lbZoom: "Actual size",
    lbFit: "Fit to screen",
    lbDialog: "Artwork viewer",
  },

  fr: {
    skip: "Aller au contenu",
    navEducation: "Parcours",
    navStack: "Stack",
    navProjects: "Projets",
    navArchive: "2D & 3D",
    navAbout: "À propos",
    navContact: "Contact",
    ctaHeader: "Me contacter",
    monsterPing: "Réveiller la créature en fond",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",

    heroKicker: "MOHAMED ZEROUALI · ÉTUDIANT INGÉNIEUR 4IIRF",
    heroTitleLine1: "Systèmes, données,",
    heroTitleLine2: "et mondes sombres.",
    heroBio:
      "Étudiant en 4ème année d'Ingénierie Informatique et Réseaux (4IIRF) à l'EMSI Fès, orienté Cybersécurité au Semestre 2, titulaire d'une Licence en Systèmes d'Information et Bases de Données à la Faculté Polydisciplinaire de Taza. Solides bases en SQL, modélisation relationnelle et développement logiciel, actuellement sur un gros projet de Machine Learning en parallèle de mes créations 2D/3D.",
    heroCtaWork: "Voir les projets",
    heroCtaArchive: "Brèche 2D & 3D (21)",
    stat1Val: "4IIRF",
    stat1Label: "EMSI Fès · Cybersécurité S2",
    stat2Val: "LICENCE",
    stat2Label: "FP Taza · Obtenue 2026",
    stat3Val: "21 ŒUVRES",
    stat3Label: "Photoshop & Blender 3D",

    eduKicker: "PARCOURS & DIPLÔMES",
    eduTitle: "Formation académique",
    eduSub: "Licence validée à Taza, cycle d'ingénieur en cours à l'EMSI Fès.",
    edu1Date: "2026 - PRÉSENT",
    edu1Badge: "EN COURS",
    edu1School: "EMSI Fès",
    edu1Degree: "4ème Année Ingénierie Informatique et Réseaux (4IIRF)",
    edu1Desc:
      "Cycle d'ingénieur en informatique et réseaux, avec spécialisation Cybersécurité prévue au Semestre 2 et développement d'un projet majeur en Machine Learning.",
    edu2Date: "2023 - 2026",
    edu2Badge: "OBTENUE",
    edu2School: "Faculté Polydisciplinaire de Taza",
    edu2Degree: "Licence en Systèmes d'Information et Bases de Données",
    edu2Desc:
      "Diplôme obtenu couvrant les bases de données relationnelles, l'analyse des systèmes d'information, la programmation, les systèmes d'exploitation et le développement logiciel.",
    edu3Date: "2023",
    edu3Badge: "OBTENU",
    edu3School: "Lycée",
    edu3Degree: "Baccalauréat - Sciences Physiques",
    edu3Desc: "Spécialité Physique et Mathématiques.",

    stackKicker: "TECH STACK",
    stackTitle: "Ce avec quoi je construis",
    stackSub: "Survolez une compétence ou tapez au clavier pour piloter le poste ASCII.",
    stackHint: "Poste ASCII interactif · tapez au clavier ou survolez la stack",
    gDatabases: "Bases de données",
    gProgramming: "Programmation",
    gSystems: "Systèmes & Sécurité",
    gAi: "Machine Learning",
    gVisual: "2D / 3D & Langues",

    projKicker: "PROJETS",
    projTitle: "À travers la brèche",
    projSub: "Travaux d'ingénierie en cours en Machine Learning, bases de données et logiciel.",
    p1Status: "EN DÉVELOPPEMENT",
    p1Title: "Projet Machine Learning",
    p1Desc:
      "Développement actuel d'un projet d'envergure en Machine Learning mêlant préparation de données, entraînement de modèles et intégration logicielle. L'architecture complète et le dépôt seront publiés dès la finalisation des étapes clés.",
    p1Note: "Développement actif · EMSI Fès 4IIRF",
    p2Status: "BIENTÔT PUBLIÉ",
    p2Title: "Projets Bases de Données & Logiciel",
    p2Desc:
      "Conceptions relationnelles (Oracle, PostgreSQL, MySQL, PL/SQL) et applications C/C++/Java/PHP en cours de préparation pour publication.",
    p2Cta: "Suivre sur GitHub",

    archKicker: "ARCHIVE 2D & 3D · HELIOS",
    archTitle: "Brèche visuelle",
    archSub:
      "Compositions Adobe Photoshop et Blender 3D. Survoler une œuvre adapte en direct l'éclairage de tout le site et de la créature ASCII à sa palette exacte.",
    archVibeHint: "Survolez ou feuilletez une œuvre pour changer la vibe du site",
    archResetVibe: "Réinitialiser la vibe",
    modeStack: "Pile",
    modePortals: "Portails (21)",
    filterAll: "Toutes",
    filterLandscape: "Paysage",
    filterPortrait: "Portrait",
    filterSquare: "Carré",
    deckPrev: "Œuvre précédente",
    deckNext: "Œuvre suivante",
    deckInspect: "Voir en plein écran",
    deckHint: "Glissez à gauche/droite, cliquez derrière, ou survolez pour changer la vibe.",

    aboutKicker: "À PROPOS",
    aboutTitle: "Code, sécurité et maîtrise",
    aboutP1:
      "Je relie deux univers : l'ingénierie structurée côté données et systèmes (bases de données relationnelles, SI, Machine Learning et Cybersécurité) et la direction artistique sombre en Blender 3D et Photoshop.",
    aboutP2:
      "Après avoir obtenu ma Licence à la Faculté Polydisciplinaire de Taza, j'ai intégré l'EMSI Fès en 4ème année (4IIRF) pour approfondir l'ingénierie logicielle et me spécialiser en Cybersécurité au Semestre 2.",
    aboutMetaSchool: "EMSI Fès (4IIRF) · Licence FP Taza",
    aboutMetaTrack: "Bases de données · Machine Learning · Cybersécurité (S2)",
    aboutMetaLang: "Arabe (Langue maternelle) · Français (B1 - B2) · Anglais (B2 - C1)",
    aboutMetaArt: "Adobe Photoshop · Blender 3D (21 œuvres)",
    offCodeTitle: "Hors du code",
    offCodeSub: "Ce qui aiguise mon regard en dehors des compilateurs et de SQL.",
    offCodeCard1Title: "HELIOS / Mondes 3D",
    offCodeCard1Desc:
      "Environnements dark fantasy, affiches typographiques et études de lumière volumétrique réalisés sur Blender 3D et Photoshop.",
    offCodeCard2Title: "Labo Cybersécurité & ML",
    offCodeCard2Desc:
      "Préparation de la spécialité Cybersécurité du Semestre 2 en parallèle de mon projet actuel en Machine Learning.",

    contactKicker: "CONTACT",
    contactTitle: "Entrer en contact",
    contactSub: "Ouvert aux stages d'ingénierie, alternances et collaborations techniques sérieuses.",
    ctEmail: "M'écrire par e-mail",
    ctEmailSub: "Via le formulaire ou par e-mail direct",
    ctLi: "LinkedIn",
    ctGh: "GitHub",
    likeTitle: "> like.exe",
    likeDesc: "Cliquez le cœur ASCII. La créature tient le compte.",
    likeCountLabel: "likes",
    formTitle: "Envoyer un message",
    fName: "Nom *",
    fEmail: "E-mail *",
    fMessage: "Message *",
    phName: "Votre nom",
    phEmail: "vous@exemple.com",
    phMessage: "Écrivez votre message ici...",
    fSend: "Envoyer",
    fSending: "Envoi...",
    errRequired: "Ce champ est obligatoire",
    errEmail: "Saisissez une adresse e-mail valide",
    fFix: "Veuillez corriger les champs signalés.",
    fMailto: "Ouverture de votre messagerie avec le message prêt à l'envoi.",
    fReadyNote: "Message validé. Contact direct : mohamed.zeroualixxx@gmail.com.",
    fSent: "Message envoyé. Je réponds rapidement.",
    fFail: "Envoi impossible pour le moment. Écrivez à mohamed.zeroualixxx@gmail.com.",

    ftRights: "Mohamed Zerouali · EMSI Fès 4IIRF",
    ftTop: "Haut de page",

    lbClose: "Fermer",
    lbPrev: "Œuvre précédente",
    lbNext: "Œuvre suivante",
    lbZoom: "Taille réelle",
    lbFit: "Ajuster à l'écran",
    lbDialog: "Visionneuse d'œuvre",
  },
};
