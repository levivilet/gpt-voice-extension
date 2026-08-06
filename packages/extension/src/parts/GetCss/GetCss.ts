const getCardDetailCss = (state: Readonly<any>): string => {
  return `.gptvoiceCardDetailPanel {
  --gptvoiceCardDetailWidth: ${state.cardDetailWidth}px;
}`
}

export const getCss = (state: Readonly<any>): string => {
  return ''
}
