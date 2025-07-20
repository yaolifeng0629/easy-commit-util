import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Config } from '../types/index.js';
import { DEFAULT_CONFIG } from './index.js';

export class ConfigManager {
  private static readonly CONFIG_FILE_NAME = '.easy-commit.json';
  private static readonly CONFIG_PATH = join(homedir(), ConfigManager.CONFIG_FILE_NAME);

  /**
   * Load configuration from file or return defaults
   */
  static load(): Config {
    try {
      if (existsSync(this.CONFIG_PATH)) {
        const content = readFileSync(this.CONFIG_PATH, 'utf-8');
        const userConfig = JSON.parse(content);
        return { ...DEFAULT_CONFIG, ...userConfig };
      }
    } catch (error) {
      console.warn(`Warning: Could not load config file: ${(error as Error).message}`);
    }

    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to file
   */
  static save(config: Partial<Config>): void {
    try {
      const existing = this.load();
      const merged = { ...existing, ...config };
      writeFileSync(this.CONFIG_PATH, JSON.stringify(merged, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${(error as Error).message}`);
    }
  }

  /**
   * Reset configuration to defaults
   */
  static reset(): void {
    try {
      writeFileSync(this.CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    } catch (error) {
      throw new Error(`Failed to reset config: ${(error as Error).message}`);
    }
  }

  /**
   * Create sample configuration file
   */
  static createSample(): void {
    const sample = {
      commitTypes: DEFAULT_CONFIG.commitTypes,
      maxDescriptionLength: DEFAULT_CONFIG.maxDescriptionLength,
      allowBreakingChanges: DEFAULT_CONFIG.allowBreakingChanges,
      pushAfterCommit: DEFAULT_CONFIG.pushAfterCommit,
      addAllFiles: DEFAULT_CONFIG.addAllFiles,
      // Additional options
      emoji: false,
      signoff: false,
      template: 'conventional',
    };

    try {
      writeFileSync(this.CONFIG_PATH, JSON.stringify(sample, null, 2));
    } catch (error) {
      throw new Error(`Failed to create sample config: ${(error as Error).message}`);
    }
  }

  /**
   * Get configuration file path
   */
  static getConfigPath(): string {
    return this.CONFIG_PATH;
  }
}