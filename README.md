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
- Bausteine innerhalb der Formel per Drag-and-drop umordnen.
- Baustein auswählen und seine Felder unter dem Editor bearbeiten.
- Leere Felder erscheinen als Platzhalter. Werte sind mathematische Texte; komplexe Teilausdrücke können als Text in die Felder eingetragen werden.
- LaTeX über den entsprechenden Reiter anzeigen und kopieren.
- Rückgängig/Wiederholen über die Symbolleiste oder Strg/Cmd+Z bzw. Umschalt+Strg/Cmd+Z.
- Die aktuelle Formel wird lokal im Browser gespeichert; es gibt keine Cloud-Synchronisierung.

`npm test` prüft die JavaScript-Syntax. Die Vorschau verwendet HTML und CSS; der Editor berechnet keine Gleichungen und interpretiert keinen beliebigen LaTeX-Code.
