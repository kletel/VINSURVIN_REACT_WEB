const getApiBaseUrl = () => {
    //debugger;
    console.log('window.location', window.location);
    const hostname = window.location.hostname;

    if (hostname === '127.0.0.1') {
        return 'http://127.0.0.1';
    }
    if (hostname === '192.168.2.130') {
        return 'http://192.168.2.130:80';
    }
    /*
    if (hostname === '192.168.2.130') {
        return 'http://192.168.2.130:30080';
    }
    // */
    if (hostname === '192.168.2.118') {
        //return 'http://192.168.2.118:4000';
        return 'https://192.168.2.118';

    }
    if (hostname === 'vinsurvin.vitissia.fr') {
        //return 'http://192.168.2.118:4000';
        return 'https://vinsurvin.vitissia.fr';

    }
    // Retourner directement l'URL basée sur le hostname
    return `https://vinsurvin.vitissia.fr`;
    //return `https://${hostname}`;
};

const config = {
    apiBaseUrl: getApiBaseUrl(),
};

console.log('API Base URL:', config.apiBaseUrl);

export default config;

/*const getApiBaseUrl = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
        return 'http://localhost:80';

    }if (hostname === '127.0.0.1') {
        return 'http://127.0.0.1';

    } else if (hostname === 'dev.savplus-btp.com') {
        return 'http://dev.savplus-btp.com';

    } else if (hostname === 'eiffage.savplus-btp.com') {
        return 'https://eiffage.savplus-btp.com';

    } else if (hostname === 'vcfprdsav01') {
        return 'https://vcfprdsav01';

    } else if (hostname === 'spie-batignolles.savplus-btp.com') {
        return 'https://spie-batignolles.savplus-btp.com';
    }
    return 'http://localhost';
};

const config = {
    apiBaseUrl: getApiBaseUrl(),
};

console.log('API Base URL:', config.apiBaseUrl);

export default config;
*/