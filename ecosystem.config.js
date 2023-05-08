module.exports = {
  apps: [
    {
      script: 'yarn start',
    },
  ],
  deploy: {
    production: {
      'key': '~/.ssh/zhrz-soundme-key.pem',
      'user': 'ubuntu',
      'host': '54.87.43.221',
      'ref': 'origin/aws-testing',
      'repo': 'https://github.com/zulhusnihariz/soundme.git',
      'path': '/home/ubuntu',
      'pre-deploy-local': '',
      'post-deploy':
        'source ~/.nvm/nvm.sh && yarn install && yarn build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh-options': 'ForwardAgent=yes',
    },
  },
}
