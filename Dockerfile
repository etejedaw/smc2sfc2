# Stage 1: Build frontend with Node 7
FROM node:8-alpine AS frontend

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run postinstall

# Stage 2: Run with Python 2.7
FROM python:2.7-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
COPY --from=frontend /app/static/dist ./static/dist
COPY --from=frontend /app/webpack-assets.json .

ENV DEBUG=true

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "routes:app"]
