import json

class AlertPublisher:
    """
    Handles publishing real-time dropout risk alerts and academic achievements
    to message brokers (Kafka) or local memory event streams.
    """
    def __init__(self, kafka_brokers=None):
        self.kafka_enabled = False
        if kafka_brokers:
            try:
                # Real Kafka integration can be loaded here if package exists
                from kafka import KafkaProducer
                self.producer = KafkaProducer(
                    bootstrap_servers=kafka_brokers,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                self.kafka_enabled = True
                print("[INFO] Kafka Alert Publisher successfully connected.")
            except ImportError:
                print("[WARN] Kafka library not installed. Running in mock/local event publisher mode.")
                self.producer = None

    def publish_alert(self, topic: str, alert_payload: dict) -> bool:
        """
        Publishes alert message. If Kafka is unreachable, logs to stdout as standard local event emitter.
        """
        print(f"[ALERT] [Alert Publisher] [{topic}] Outflow: {json.dumps(alert_payload)}")
        if self.kafka_enabled and self.producer:
            try:
                self.producer.send(topic, alert_payload)
                self.producer.flush()
                return True
            except Exception as e:
                print(f"[ERROR] Failed to send Kafka alert: {e}")
        return False
