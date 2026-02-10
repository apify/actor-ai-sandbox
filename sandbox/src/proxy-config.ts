/**
 * Proxy Configuration Module
 *
 * Manages proxy mapping configuration with file watching for live updates.
 */

import { existsSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

import { log } from 'apify';

import { PROXY_CONFIG_PATH } from './consts.js';
import type { ProxyMapping } from './types.js';

// Current proxy mappings (in-memory cache)
let currentMappings: ProxyMapping[] = [];

// Callbacks to notify when mappings change
const changeListeners: Array<(mappings: ProxyMapping[]) => void> = [];

/**
 * Initialize proxy configuration from input and start file watching
 * @param initialMappings - Initial mappings from Actor input
 */
export const initializeProxyConfig = (initialMappings?: ProxyMapping[]): void => {
    // First try to load from config file (persisted state)
    if (existsSync(PROXY_CONFIG_PATH)) {
        try {
            const fileContent = readFileSync(PROXY_CONFIG_PATH, 'utf-8');
            currentMappings = JSON.parse(fileContent);
            log.info('Loaded proxy mappings from config file', {
                count: currentMappings.length,
                mappings: currentMappings,
            });
        } catch (error) {
            log.warning('Failed to load proxy config file, using input mappings', {
                error: (error as Error).message,
            });
            currentMappings = initialMappings || [];
        }
    } else if (initialMappings && initialMappings.length > 0) {
        // Use input mappings and save to config file
        currentMappings = initialMappings;
        saveProxyConfig(currentMappings);
        log.info('Initialized proxy mappings from Actor input', {
            count: currentMappings.length,
            mappings: currentMappings,
        });
    }

    // Start watching config file for changes
    startConfigWatcher();
};

/**
 * Save proxy mappings to config file
 * @param mappings - Mappings to save
 */
export const saveProxyConfig = (mappings: ProxyMapping[]): void => {
    try {
        // Ensure directory exists
        const dir = dirname(PROXY_CONFIG_PATH);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        writeFileSync(PROXY_CONFIG_PATH, JSON.stringify(mappings, null, 2));
        currentMappings = mappings;
        log.info('Saved proxy mappings to config file', {
            count: mappings.length,
            path: PROXY_CONFIG_PATH,
        });

        // Notify listeners
        notifyListeners();
    } catch (error) {
        log.error('Failed to save proxy config', { error: (error as Error).message });
        throw error;
    }
};

/**
 * Get current proxy mappings
 */
export const getProxyMappings = (): ProxyMapping[] => {
    return [...currentMappings];
};

/**
 * Add a proxy mapping
 * @param mapping - Mapping with path and target URL
 */
export const addProxyMapping = (mapping: ProxyMapping): void => {
    // Normalize path to ensure it starts with /
    const normalizedPath = mapping.path.startsWith('/') ? mapping.path : `/${mapping.path}`;
    
    // Normalize target URL - add http:// if no protocol
    let normalizedTarget = mapping.target.trim();
    if (!normalizedTarget.startsWith('http://') && !normalizedTarget.startsWith('https://')) {
        normalizedTarget = `http://${normalizedTarget}`;
    }

    const normalizedMapping = { path: normalizedPath, target: normalizedTarget };

    // Check for duplicate paths
    const existingIndex = currentMappings.findIndex((m) => m.path === normalizedPath);
    if (existingIndex >= 0) {
        // Update existing mapping
        currentMappings[existingIndex] = normalizedMapping;
    } else {
        currentMappings.push(normalizedMapping);
    }

    saveProxyConfig(currentMappings);
};

/**
 * Remove a proxy mapping by path
 * @param path - Path to remove
 */
export const removeProxyMapping = (path: string): boolean => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const initialLength = currentMappings.length;
    currentMappings = currentMappings.filter((m) => m.path !== normalizedPath);

    if (currentMappings.length < initialLength) {
        saveProxyConfig(currentMappings);
        return true;
    }
    return false;
};

/**
 * Register a callback to be called when mappings change
 * @param callback - Function to call with new mappings
 */
export const onMappingsChange = (callback: (mappings: ProxyMapping[]) => void): void => {
    changeListeners.push(callback);
};

/**
 * Notify all listeners of mapping changes
 */
const notifyListeners = (): void => {
    for (const listener of changeListeners) {
        try {
            listener([...currentMappings]);
        } catch (error) {
            log.error('Error in proxy config change listener', { error: (error as Error).message });
        }
    }
};

/**
 * Start watching the config file for external changes
 */
const startConfigWatcher = (): void => {
    // Ensure directory exists before watching
    const dir = dirname(PROXY_CONFIG_PATH);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // Debounce timeout
    let debounceTimer: NodeJS.Timeout | null = null;

    try {
        watch(dir, (eventType, filename) => {
            if (filename === '.proxy-mappings.json' && eventType === 'change') {
                // Debounce rapid changes
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }

                debounceTimer = setTimeout(() => {
                    try {
                        if (existsSync(PROXY_CONFIG_PATH)) {
                            const fileContent = readFileSync(PROXY_CONFIG_PATH, 'utf-8');
                            const newMappings = JSON.parse(fileContent);

                            // Only update if actually changed
                            if (JSON.stringify(newMappings) !== JSON.stringify(currentMappings)) {
                                currentMappings = newMappings;
                                log.info('Proxy config file changed, reloading mappings', {
                                    count: currentMappings.length,
                                });
                                notifyListeners();
                            }
                        }
                    } catch (error) {
                        log.error('Error reloading proxy config', { error: (error as Error).message });
                    }
                }, 100);
            }
        });

        log.info('Started watching proxy config file for changes', { path: PROXY_CONFIG_PATH });
    } catch (error) {
        log.warning('Failed to start config file watcher', { error: (error as Error).message });
    }
};
