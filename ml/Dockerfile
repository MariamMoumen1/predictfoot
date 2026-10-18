FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir numpy
RUN useradd --system --uid 1001 mluser
COPY app.py model.json team_stats.json ./
ENV PORT=8010
USER mluser
EXPOSE 8010
CMD ["python", "app.py"]