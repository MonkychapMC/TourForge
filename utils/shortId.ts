export const generateShortId = (): string => {
    return crypto.randomUUID().substring(0, 8);
};
