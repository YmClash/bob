import { EventEmitter } from 'events';
import chalk from 'chalk';

/**
 * Message Queue with Semaphore for Sequential Processing
 * Garantit que les messages sont traités un par un dans l'ordre
 */
export class MessageQueue extends EventEmitter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;
  private currentSpeaker: string = '';

  constructor() {
    super();
  }

  /**
   * Ajoute une tâche à la queue
   */
  async enqueue(task: () => Promise<void>, speakerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          this.currentSpeaker = speakerName;
          console.log(chalk.yellow(`[Queue] ${speakerName} en attente...`));

          await task();

          console.log(chalk.green(`[Queue] ${speakerName} terminé`));
          resolve();
        } catch (error) {
          console.error(chalk.red(`[Queue] Erreur pour ${speakerName}:`), error);
          reject(error);
        }
      };

      this.queue.push(wrappedTask);
      this.processNext();
    });
  }

  /**
   * Traite le prochain élément de la queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift();

    if (task) {
      try {
        await task();
      } catch (error) {
        console.error(chalk.red('[Queue] Erreur lors du traitement:'), error);
      }
    }

    this.isProcessing = false;

    // Petit délai avant le prochain pour éviter l'emballement
    setTimeout(() => {
      this.processNext();
    }, 500);
  }

  /**
   * Vide la queue
   */
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
    this.currentSpeaker = '';
    console.log(chalk.gray('[Queue] Queue vidée'));
  }

  /**
   * Retourne la taille de la queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Retourne qui parle actuellement
   */
  getCurrentSpeaker(): string {
    return this.currentSpeaker;
  }

  /**
   * Attend que la queue soit vide
   */
  async waitForEmpty(): Promise<void> {
    return new Promise((resolve) => {
      const checkQueue = setInterval(() => {
        if (this.queue.length === 0 && !this.isProcessing) {
          clearInterval(checkQueue);
          resolve();
        }
      }, 100);
    });
  }
}

// Singleton pour utilisation globale
export const messageQueue = new MessageQueue();