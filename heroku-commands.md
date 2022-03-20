# Criar arquivo de configuração `heroku.yml` na raiz do projeto.

```bash
npm i -g heroku
heroku login
heroku apps:create js-expert-06
// Confirm
git remote -v

heroku stack:set container
heroku open
heroku logs -t
heroku apps:delete
```