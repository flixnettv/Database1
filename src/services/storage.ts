import { get, set } from 'idb-keyval';

export class StorageService {
  private useLocalOnly = false;
  private listeners: Record<string, ((data: any) => void)[]> = {};

  subscribe(table: string, callback: (data: any) => void) {
    if (!this.listeners[table]) this.listeners[table] = [];
    this.listeners[table].push(callback);
    return () => {
      this.listeners[table] = this.listeners[table].filter(l => l !== callback);
    };
  }

  private notify(table: string, data: any) {
    if (this.listeners[table]) {
      this.listeners[table].forEach(l => l(data));
    }
  }

  async setLocalOnly(value: boolean) {
    this.useLocalOnly = value;
    await set('useLocalOnly', value);
  }

  async isLocalOnly(): Promise<boolean> {
    const saved = await get('useLocalOnly');
    return saved || this.useLocalOnly;
  }

  async query<T>(table: string, options: { 
    select?: string; 
    eq?: [string, any]; 
    order?: [string, { ascending: boolean }];
    limit?: number;
  }): Promise<{ data: T[] | null; error: any }> {
    const localOnly = await this.isLocalOnly();
    
    if (!localOnly) {
      try {
        const queryParams = new URLSearchParams();
        if (options.select) queryParams.append('select', options.select);
        if (options.eq) queryParams.append('eq', options.eq.join(','));
        if (options.order) queryParams.append('order', `${options.order[0]},${options.order[1].ascending}`);
        if (options.limit) queryParams.append('limit', options.limit.toString());
        
        const response = await fetch(`/api/query/${table}?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to query');
        return { data: await response.json(), error: null };
      } catch (err) {
        console.error(`Neon query error on ${table}:`, err);
      }
    }

    // Local Storage Fallback
    try {
      const localData = (await get(`table_${table}`) || []) as any[];
      let filtered = [...localData];
      if (options.eq) {
        filtered = filtered.filter((item: any) => item[options.eq![0]] === options.eq![1]);
      }
      if (options.order) {
        filtered.sort((a: any, b: any) => {
          const valA = a[options.order![0]];
          const valB = b[options.order![0]];
          return options.order![1].ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
      }
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      return { data: filtered as T[], error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async insert(table: string, data: any[]): Promise<{ data: any[] | null; error: any }> {
    const localOnly = await this.isLocalOnly();
    let resData: any[] | null = null;

    if (!localOnly) {
      try {
        const response = await fetch(`/api/insert/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to insert');
        resData = await response.json();
      } catch (err) {
        console.error(`Neon insert error on ${table}:`, err);
      }
    }

    // Always update local storage as a cache and for immediate notification
    try {
      const localData = await get(`table_${table}`) || [];
      const itemsToStore = resData || data.map(item => ({ 
        id: crypto.randomUUID(), 
        created_at: new Date().toISOString(),
        ...item 
      }));
      
      localData.push(...itemsToStore);
      await set(`table_${table}`, localData);
      this.notify(table, localData);
      
      return { data: itemsToStore, error: null };
    } catch (err) {
      return { data: resData, error: err };
    }
  }

  async upsert(table: string, data: any, options: { on: string }): Promise<{ error: any }> {
    const localOnly = await this.isLocalOnly();

    if (!localOnly) {
      try {
        const response = await fetch(`/api/upsert/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, options })
        });
        if (!response.ok) throw new Error('Failed to upsert');
      } catch (err) {
        console.error(`Neon upsert error on ${table}:`, err);
      }
    }

    // Update local storage
    try {
      const localData = await get(`table_${table}`) || [];
      const index = localData.findIndex((item: any) => item[options.on] === data[options.on]);
      if (index >= 0) {
        localData[index] = { ...localData[index], ...data };
      } else {
        localData.push(data);
      }
      await set(`table_${table}`, localData);
      this.notify(table, localData);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  async delete(table: string, options: { eq: [string, any] }): Promise<{ error: any }> {
    const localOnly = await this.isLocalOnly();
    
    if (!localOnly) {
      try {
        const response = await fetch(`/api/delete/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options)
        });
        if (!response.ok) throw new Error('Failed to delete');
      } catch (err) {
        console.error(`Neon delete error on ${table}:`, err);
      }
    }

    // Always update local storage
    try {
      const localData = await get(`table_${table}`) || [];
      const filtered = localData.filter((item: any) => item[options.eq[0]] !== options.eq[1]);
      const changed = localData.length !== filtered.length;
      if (changed) {
        await set(`table_${table}`, filtered);
        this.notify(table, filtered);
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }
}

export const storageService = new StorageService();
