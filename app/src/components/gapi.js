import { gapi } from 'gapi-script';

const calendarKey = import.meta.env.VITE_CALENDAR_API_KEY;

export const initGAPI = () => {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: calendarKey,
            clientId: '317430558522-842q802200ue859sc98bic3n5b2cfql6.apps.googleusercontent.com',
            scope: ['https://www.googleapis.com/auth/calendar', ],
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
        });

        gapi.client.load('calendar', 'v3', () => {
            console.log('GAPI Calendar API loaded');
        });
    });
};

export const getAuthToken = async () => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    if (!GoogleAuth.isSignedIn.get()) {
        await GoogleAuth.signIn();
    }
    return GoogleAuth.currentUser.get().getAuthResponse().access_token;
};

export default gapi;
