import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection, Channel, connect } from 'amqplib';
import 'dotenv/config';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: Connection;
  public channel: Channel;

  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      this.logger.log('RabbitMQ connected (REAL)');
    } catch (err) {
      this.logger.error('RabbitMQ connection failed, retrying...', err);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async sendToQueue(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    this.logger.log(`Message sent to queue: ${queue}`);
  }
}
