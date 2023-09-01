// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract LoyaltyProgram {
  // Struct to represent campaign details
  struct Campaign {
    string name;
    string emailSubject;
    string emailContent;
    string topic;
  }

  // Mapping to store all campaigns
  mapping(address => Campaign) public campaigns;
  address[] public campaignOwners;

  // Event to emit when a new campaign is added
  event CampaignAdded(address indexed campaignAddress, string name);

  // Modifier to check if the campaign already exists
  modifier campaignExists(address campaignAddress) {
    require(
      bytes(campaigns[campaignAddress].name).length > 0,
      'Campaign does not exist'
    );
    _;
  }

  // Function to add a new campaign
  function addCampaign(
    string memory name,
    string memory emailSubject,
    string memory emailContent,
    string memory topic
  ) external {
    // Make sure the campaign does not already exist
    require(
      bytes(campaigns[msg.sender].name).length == 0,
      'Campaign already exists'
    );

    // Create a new campaign and store it in the mapping
    Campaign memory newCampaign = Campaign(
      name,
      emailSubject,
      emailContent,
      topic
    );
    campaigns[msg.sender] = newCampaign;
    campaignOwners.push(msg.sender);

    // Emit the CampaignAdded event
    emit CampaignAdded(msg.sender, name);
  }

  // Function to get campaign details by address
  function getCampaignInfoByAddress(
    address campaignAddress
  )
    external
    view
    campaignExists(campaignAddress)
    returns (
      string memory name,
      string memory emailSubject,
      string memory emailContent,
      string memory topic
    )
  {
    Campaign storage campaign = campaigns[campaignAddress];
    return (
      campaign.name,
      campaign.emailSubject,
      campaign.emailContent,
      campaign.topic
    );
  }

  function getList() public view returns (Campaign[] memory) {
    return campaignOwners;
  }
}
