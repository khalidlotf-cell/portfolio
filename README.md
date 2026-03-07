# 📱 Portfolio Khalid LOTF - Version Simple HTML/CSS/JS

Bienvenue ! Ceci est une version **super simple** de votre portfolio en **HTML pur**, **CSS** et **JavaScript** - facile à modifier pour un débutant.

## 🚀 Comment l'utiliser

1. **Ouvrez le fichier** `index.html` dans votre navigateur (double-clic)
2. **C'est tout !** Le site fonctionne immédiatement avec toutes les animations

## 📝 Comment modifier le contenu

### Modifier le texte
Ouvrez `index.html` avec un éditeur de texte (VS Code, Notepad++, etc.) et cherchez le texte que vous voulez changer.

**Exemple :**
```html
<h1>Khalid LOTF</h1>  <!-- Changez "Khalid LOTF" par votre nom -->
```

### Modifier les images
1. Remplacez les images dans le dossier `images/`
2. Gardez les mêmes noms de fichiers, ou changez les chemins dans `index.html`

**Exemple :**
```html
<img src="images/profile.jpg" alt="Khalid LOTF">  <!-- Changez "profile.jpg" -->
```

### Modifier les couleurs
Ouvrez `css/style.css` et cherchez la section "VARIABLES DE COULEURS" en haut :

```css
:root {
  --bg-color: #f8f7f5;        /* Couleur de fond */
  --text-color: #3d3d3d;      /* Couleur du texte */
  --accent-color: #d97060;    /* Couleur d'accent (rose) */
  /* ... */
}
```

Changez les codes couleur (ex: `#d97060`) pour modifier les couleurs du site.

### Modifier les liens de contact
Cherchez cette section dans `index.html` :

```html
<a href="mailto:khalid@example.com">khalid@example.com</a>  <!-- Changez l'email -->
<a href="tel:+33612345678">+33 6 12 34 56 78</a>  <!-- Changez le téléphone -->
```

### Ajouter ou supprimer des projets
Cherchez la section "PROJETS" et copiez/collez une carte de projet :

```html
<div class="project-card fade-in-up stagger-1" data-animate>
  <div>
    <h3>Nom du projet</h3>  <!-- Changez le nom -->
    <p>Description du projet</p>  <!-- Changez la description -->
  </div>
  <div class="project-count">X créations</div>  <!-- Changez le nombre -->
</div>
```

## 🎨 Les animations sont préservées

✅ **Animations incluses :**
- Fade-in au chargement (apparition progressive)
- Stagger (décalage d'apparition)
- Hover effects (effets au survol)
- Scale (agrandissement au survol)
- Transitions fluides

Tout est automatique - rien à configurer !

## 📁 Structure des fichiers

```
khalid-portfolio-simple/
├── index.html          ← Le fichier principal (ouvrez-le dans le navigateur)
├── css/
│   └── style.css       ← Les styles et animations
├── js/
│   └── script.js       ← La navigation et les interactions
├── images/             ← Vos images
│   ├── profile.jpg
│   ├── hero-bg.jpg
│   └── ... (autres images)
└── README.md           ← Ce fichier
```

## 💡 Conseils pour les débutants

1. **Sauvegardez avant de modifier** - Faites une copie du fichier original
2. **Modifiez un élément à la fois** - Testez après chaque modification
3. **Utilisez un éditeur de texte** - VS Code (gratuit) est recommandé
4. **Testez dans le navigateur** - Appuyez sur F5 pour recharger

## 🔧 Personnalisation avancée

### Changer les fonts
Dans `index.html`, cherchez :
```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Vous pouvez changer les fonts sur [Google Fonts](https://fonts.google.com)

### Ajouter des sections
Copiez une section complète dans `index.html` et adaptez-la.

### Modifier les animations
Dans `css/style.css`, cherchez `@keyframes fadeInUp` pour modifier les animations.

## ❓ Questions fréquentes

**Q: Comment ajouter un lien vers mes réseaux sociaux ?**
A: Ajoutez un lien dans le footer ou dans la section contact :
```html
<a href="https://instagram.com/votreprofil">Instagram</a>
```

**Q: Comment faire fonctionner le formulaire de contact ?**
A: Actuellement, il affiche juste un message. Pour l'envoyer par email, vous aurez besoin d'un service comme Formspree ou EmailJS.

**Q: Puis-je ajouter des vidéos ?**
A: Oui ! Utilisez une balise `<video>` :
```html
<video width="100%" controls>
  <source src="images/video.mp4" type="video/mp4">
</video>
```

## 📞 Besoin d'aide ?

Si vous avez des questions, consultez :
- [MDN Web Docs](https://developer.mozilla.org/) - Documentation HTML/CSS/JS
- [W3Schools](https://www.w3schools.com/) - Tutoriels interactifs

---

**Bon développement ! 🎉**
