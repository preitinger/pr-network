export function isObjectEmpty(o: object) {
    for (const _key in o) {
        return false;
    }
    return true;
}