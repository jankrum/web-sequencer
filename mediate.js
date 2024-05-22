class Mediator {
    // Things that the mediator needs to know about
    constructor() {
        this.transporter = null;
        this.leader = null;
    }

    // Sets the transporter for the mediator
    setTransporter(transporter) {
        this.transporter = transporter;
    }

    // Sets the leader for the mediator
    setLeader(leader) {
        this.leader = leader;
    }

    // This is called by the transporter to send a button press to the leader
    sendButtonPressedFromTransporterToLeader(buttonPressed) {
        this.leader.receiveTransporterButtonPress(buttonPressed);
    }

    // This is called by the leader to send a state to the transporter
    sendStateFromLeaderToTransporter(state) {
        this.transporter.receiveState(state);
    }
}

const mediator = new Mediator();
export default function mediate(...colleagues) {
    colleagues.forEach(colleague => colleague.assignMediator(mediator));
}