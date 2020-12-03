# CS4500ChemistryNightmare
A project for a class

## Platform
We are only supporting desktop browsers Google Chrome and Firefox.

## Gameplay
Players begin on the main page. Registration is not required, so players will not need to worry about setting up an account. To start playing, a player clicks the play button. It will transfer them to the waiting room page, which shows all currently waiting players. The player will wait until another waiting player gets paired with them, and then the game can begin. A game consists of only two players, and they are randomly assigned a role: Chemist (Player One) or Researcher (Player Two). On the Researcher’s screen, they see a beaker, consisting of random properties (i.e., volume, color, pH, and temperature) and tools. On the Chemists’ screen, they see an empty beaker and tools on a table. For the Researcher to know the beaker’s properties, they will need to use their tools: a ruler, color wheel, pH meter, and thermometer. The Researcher and Chemist communicate through text or voice only. To win, the Chemist will use their tools to mimic the Researcher’s beaker: distilled water, food coloring droppers, pH droppers, a bunsen burner, an icebox, and a magic potion to remove a specific color. Also, a player cannot see the other player’s view, so communication is required. Upon winning, both players will get a message specifying how their game went, and then they can click a button to direct them back to the main page.

## User Interface
Our interaction mechanic is a two-click process. The first item clicked will interact with the second item clicked, but only if the second item can be interacted with using the first item. For example, clicking a tool, then the beaker is a legal interaction, but clicking a tool with another tool is not. The player’s beaker and tools will be visible on the screen. To communicate, a player can use either a textbox to send messages or toggle a button to enable and disable voice.

To run the application:
```
npm run start:dev
```