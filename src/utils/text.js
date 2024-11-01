

const normalize = (text) => {
    const chars = [' ', '.', ',', '/', '-'];
    for(const char of chars) {
        text = text.replaceAll(char, '');
    }
    return text.trim().toLowerCase();
}

module.exports = {
    normalize
}