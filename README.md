# builtin.gpt-voice

gpt-voice extension for Lvce Editor.

## OpenAI API key setup

The extension now fetches ephemeral tokens directly from OpenAI, so no local node token server is used.

On first start, the view shows a welcome form where you save your OpenAI API key.
The key is stored using extension secret storage when available (`Extensions.storeSecret`)
and falls back to a cache-based local storage implementation when secrets are not supported.

To remove/re-enter a key, use **Change API key** in the extension view.

## Development

```sh
npm ci
npm run build
npm test
```
