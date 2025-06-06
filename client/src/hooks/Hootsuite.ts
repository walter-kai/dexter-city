import { useNavigate } from 'react-router-dom';
// Ensure TypeScript recognizes the Hootsuite SDK types
declare var hsp: any; // Use 'declare' to reference the global Hootsuite object from the SDK

export class Hootsuite {

  // Define getUser as a method
  static getUser() {
    // Ensure hsp is defined before calling the method
    if (typeof hsp !== 'undefined') {
      hsp.showUser('hootsuite');
    } else {
      console.error('Hootsuite SDK is not loaded. Make sure to include the Hootsuite SDK script.');
    }
  }

  static showImage(src: string) {
    // Ensure hsp is defined before calling the method
    if (typeof hsp !== 'undefined') {
      hsp.showImagePreview(src);
    } else {
      console.error('Hootsuite SDK is not loaded. Make sure to include the Hootsuite SDK script.');
    }
  }


  static init() {
    
    // Ensure Hootsuite SDK is loaded and ready
    if (typeof hsp !== 'undefined') {
      hsp.init({
        useTheme: true, // Optional configuration to match Hootsuite's theme
        callBack: () => {
          console.log('Hootsuite SDK initialized');
          
          // Bind the 'refresh' event
          hsp.bind('refresh', () => {
            // console.log('Refresh event triggered');
            // window.location.reload();
            const navigate = useNavigate();
            navigate('/');
          });

          // Bind the 'dropuser' event
          hsp.bind('dropuser', (username: string, tweetID: string) => {
            console.log(`Dropuser event triggered for username: ${username}, tweetID: ${tweetID}`);
            hsp.showUser(username);
          });


        }
      });

      hsp.getMemberInfo(function(data: { userId: number; teamIds: number[]; }){
            //callback handler
            console.log('id',data.userId);  //5339913            // @bypasshook
            console.log('ids',data.teamIds); //[151906,154887]    // @bypasshook
        });

        hsp.getMemberInfo();

    //   hsp.showCustomPopup(
    //     {
    //         url: "https://ca.nextdoor.com/v3/authorize/?scope=openid%20post:write%20post:read%20comment:write&client_id=hootsuite_b5898e51&redirect_uri=https://hs-nextdoor-0140b3823f77.herokuapp.com/api/callback",
    //         title: "Sample App Popup",
    //         w: 800,
    //         h: 400
    //     }
    // );
    } else {
      console.error('Hootsuite SDK is not loaded. Make sure to include the Hootsuite SDK script.');
    }
  }
}
