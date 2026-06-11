const logo = {
  left: [
    "ZZZZZ X   X",
    "   Z   X X ",
    "  Z     X  ",
    " Z     X X ",
    "ZZZZZ X   X",
  ],
  right: [
    " CCCC  OOO  DDDD  EEEEE",
    "C     O   O D   D E    ",
    "C     O   O D   D EEEE ",
    "C     O   O D   D E    ",
    " CCCC  OOO  DDDD  EEEEE",
  ],
}

const reset = "\x1b[0m"
const bold = "\x1b[1m"
const dim = "\x1b[90m"

function wordmark(pad = "") {
  const draw = (line: string, fg: string) =>
    [...line]
      .map((char) => {
        if (char === " ") return " "
        return `${fg}${char}${reset}`
      })
      .join("")

  return logo.left.map((line, index) => {
    const left = draw(line, dim)
    const right = draw(logo.right[index] ?? "", reset)
    return `${pad}${left} ${right}`
  })
}

export function sessionEpilogue(input: { title: string; sessionID?: string }) {
  const weak = (text: string) => `${dim}${text.padEnd(10, " ")}${reset}`
  return [
    ...wordmark("  "),
    "",
    `  ${weak("Session")}${bold}${input.title}${reset}`,
    `  ${weak("Continue")}${bold}zxcode -s ${input.sessionID}${reset}`,
    "",
  ].join("\n")
}
