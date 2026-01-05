# VHS tape file for generating demo screenshot
# https://github.com/charmbracelet/vhs

Output assets/demo-preview.png

Set Shell "bash"
Set FontSize 14
Set Width 1000
Set Height 700
Set Padding 20

# Run demo (build is done in CI beforehand)
Type "node bin/demo.js"
Enter
Sleep 2s
