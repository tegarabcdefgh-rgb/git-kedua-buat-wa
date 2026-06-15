from pathlib import Path

root = Path('.')
root.joinpath('Dockerfile').write_text(
    'FROM node:20-bullseye-slim\n\n'
    'WORKDIR /usr/src/app\n\n'
    'COPY package*.json ./\n'
    'RUN npm install --production\n\n'
    'COPY . .\n\n'
    'ENV NODE_ENV=production\n\n'
    'CMD ["npm", "run", "start"]\n',
    encoding='utf-8'
)
root.joinpath('Procfile').write_text('web: npm run start\n', encoding='utf-8')
root.joinpath('.dockerignore').write_text(
    'node_modules\nnpm-debug.log\nDockerfile\n.dockerignore\n.git\n.gitignore\nauth_info\n.env\n*.log\n',
    encoding='utf-8'
)
print('deploy files written')
