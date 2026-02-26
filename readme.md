# Dotlan Improvements Enhanced

A Tampermonkey / Greasemonkey UserScript for EVE Online players that extends the functionality of [Dotlan Evemaps](https://evemaps.dotlan.net/), specifically focusing on advanced jump fatigue and reactivation timer calculations for capital ship routes.

## Features

This script seamlessly integrates into the Dotlan jump planner (`https://evemaps.dotlan.net/jump/*`) and provides the following enhancements:

*   **Accurate Fatigue Tracking:** Automatically calculates Jump Fatigue and Reactivation Timers based on the selected ship type and jump distances.
*   **Comprehensive Ship Support:** Includes accurate fatigue multipliers for all jump-capable vessels, including Black Ops, Jump Freighters, Carriers, Dreadnoughts, Force Auxiliaries, Supercarriers, Titans, and Jump Bridges.
*   **Interactive Wait Times:** Allows you to input your starting fatigue and manually adjust the wait times between each jump to see how it affects your overall route.
*   **Route Summaries:** Adds a summary row at the bottom of the jump table displaying:
    *   **Arrival Fatigue:** Your expected fatigue upon completing the final jump.
    *   **Arrival Reactivation:** Your expected reactivation timer upon completing the final jump.
    *   **All Red Timers:** The total sum of mandatory reactivation timers across the entire route.
    *   **Full ETA:** The total time required to complete the route, factoring in all wait times.
*   **Wait Time Adjustment Buttons:** Includes three one-click buttons to automatically calculate wait times based on common travel strategies:
    *   **Minimize Fatigue on Route:** Automatically set the wait time for each jump to ensure each jump is treated as if it were your first jump for fatigue generation.
    *   **Minimize Wait:** Set the minimum possible wait times for every jump except for the last jump on your route, which will be set to minimize your fatigue upon arrival.
    *   **Reset:** Resets all wait times to only the mandatory reactivation (red) timers (fastest possible travel time, highest accumulated fatigue).

## Installation

1.  Ensure you have a UserScript manager installed in your browser, such as [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Safari, Firefox) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox).
2.  If you are using a Chromium based browser, additional configuration is necessary due to the changes imposed with Manifest v3. Tampermonkey has a decent walkthrough on their [FAQ](https://www.tampermonkey.net/faq.php#Q209)
3.  Install the script by clicking on the `dotlan_improvements_enhanced.user.js` file, opening it as raw, and adding it to your extension; or by copying the contents of the file and creating a new script manually in your manager's dashboard.

## Usage

1.  Navigate to [Dotlan's Jump Planner](https://evemaps.dotlan.net/jump).
2.  Select your starting system, destination, and any waypoints.
3.  Ensure you select your specific ship type from the dropdown, as this is crucial for accurate fatigue multiplier calculations.
4.  Generate the route.
5.  The script will automatically insert additional rows and columns into the jump table, detailing the fatigue and reactivation timers for each step. Use the input boxes to adjust wait times or the Wait Time Adjustment buttons below the table to optimize your journey.

## Disclaimer

Please note that this script is a modified and enhanced version of an original script that was provided without explicit attribution. If you are the original author, please reach out with evidence of authorship, and I will gladly provide the appropriate credit.

## Author

*   Quinn Munba

## License

This project is licensed under the MIT License.
