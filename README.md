RPI Offcampus Housing
![CI](https://github.com/rcos/rpi-offcampus-housing/workflows/CI/badge.svg?branch=master)

### Development Commands for Docker

- Running the application: `bin/roh-compose-development up` and stop with `Ctrl+c`
- Where are my packages? (Run when dependencies are changed): `bin/roh-compose-development build`
- Clean up after you work (Remove containers and network): `bin/roh-compose-development down`
- Nuke everything (Remove containers, network, and volumes): `bin/roh-compose-development down -v`
