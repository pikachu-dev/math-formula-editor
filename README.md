# Forma – Formula Studio

Ein visueller Formel-Editor ohne externe Laufzeit-Abhängigkeiten.

## Starten

Node.js 20 oder neuer:

```sh
npm run dev
```

Der Server lauscht auf Port 3000; `PORT` überschreibt den Port.

## Bedienung

- Bausteine aus der rechten Palette hineinziehen oder anklicken.
- Bausteine innerhalb der Formel per Drag-and-drop umordnen, auch zwischen Zähler, Nenner und der Hauptebene.
- Zähler und Nenner eines Bruchs nehmen mehrere Bausteine und verschachtelte Brüche auf. Leere Bereiche anklicken (oder per Tab und Enter auswählen), dann Bausteine in der Palette anklicken. Bestehende Textwerte bleiben als Rückfallwerte erhalten, wenn ein Bereich keine Bausteine enthält.
- Baustein auswählen und seine Felder unter dem Editor bearbeiten.
- Leere Felder erscheinen als Platzhalter. Werte sind mathematische Texte; komplexe Teilausdrücke können als Text in die Felder eingetragen werden.
- LaTeX über den entsprechenden Reiter anzeigen und kopieren; mit „↓ .tex“ als vollständiges LaTeX-Dokument herunterladen.
- „↓ PNG“ exportiert die Formel in doppelter Auflösung mit weißem Hintergrund, unabhängig von Zoom und Farbschema.
- Dark Mode ist standardmäßig aktiv. Der Schalter in der Kopfzeile wechselt zum hellen Modus und speichert die Auswahl lokal.
- Zehn zusätzliche Elemente: Produkt, Grenzwert, Fakultät, Binomialkoeffizient, Vektor, Logarithmus, kleiner als, größer als, ungleich und Plusminus.
- Rückgängig/Wiederholen über die Symbolleiste oder Strg/Cmd+Z bzw. Umschalt+Strg/Cmd+Z.
- Die aktuelle Formel wird lokal im Browser gespeichert; es gibt keine Cloud-Synchronisierung.

`npm test` prüft die JavaScript-Syntax. Die Vorschau verwendet HTML und CSS; der Editor berechnet keine Gleichungen und interpretiert keinen beliebigen LaTeX-Code.
