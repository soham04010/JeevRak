import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const reduxStorage = {
   
 setItem: (key: string, val: any) => {
        storage.set(key, val);
        return Promise.resolve(true)
    },
    getItem:(key: string) => {
        const value = storage.getString(key);
        return Promise.resolve(value)
    },
    removeItem: (key: string) => {
        storage.delete(key);
        return Promise.resolve()
    },
}

export default reduxStorage;