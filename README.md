![CI](https://github.com/rcos/rpi-offcampus-housing/workflows/CI/badge.svg?branch=master)

![Unnamed Project #1001](https://i.imgur.com/n0Hut25.png)
---

### Development Stack
![Development Stack](https://i.imgur.com/2xfwy5Z.png)

#### Frontend: ReactJS + Redux
#### Backend: NodeJS + MongoDB, Resources provided by REST API

---
### Development Commands for Docker

- Running the application: `bin/roh-compose-development up` and stop with `Ctrl+c`
- Where are my packages? (Run when dependencies are changed): `bin/roh-compose-development build`
- Clean up after you work (Remove containers and network): `bin/roh-compose-development down`
- Nuke everything (Remove containers, network, and volumes): `bin/roh-compose-development down -v`
