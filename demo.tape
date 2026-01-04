# VHS tape file for generating demo screenshot
# https://github.com/charmbracelet/vhs

Output assets/demo-preview.png
Output assets/demo-preview.gif

Set Shell "bash"
Set FontSize 14
Set Width 1200
Set Height 800
Set Padding 20

# Build and run demo
Type "npm run build && node bin/demo.js"
Enter
Sleep 3s
