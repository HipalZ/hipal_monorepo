export const matchCondition = (data: Record<string, any>, condition: any) => {
  return Object.values(data).filter((user) => {
    let visitMatch = true;
    let spendMatch = true;

    if (condition.visitType) {
      switch (condition.visitType) {
        case "ABOVE":
          visitMatch = user.visit > condition.visit;
          break;
        case "BELOW":
          visitMatch = user.visit < condition.visit;
          break;
        case "EQUAL":
          visitMatch = user.visit === condition.visit;
          break;
      }
    }

    if (condition.spendType) {
      switch (condition.spendType) {
        case "ABOVE":
          spendMatch = user.spend > condition.spend;
          break;
        case "BELOW":
          spendMatch = user.spend < condition.spend;
          break;
        case "EQUAL":
          spendMatch = user.spend === condition.spend;
          break;
      }
    }

    return visitMatch && spendMatch;
  });
};

export const getDefaultGroups = (businessId: string) => {
  const defaultGroups = [
    {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      name: "Best Users",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 10,
          visitType: "ABOVE",
          spend: 300,
          spendType: "ABOVE",
        },
      ],
      autoUpdate: true,
      isDeleted: false,

      userIds: [],
      groupColor: "#2ecc71",
      groupType: "DYNAMIC",
      isDefault: true,
    },
    {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      name: "Average Users",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 7,
          visitType: "ABOVE",
          spend: 250,
          spendType: "ABOVE",
        },
      ],
      autoUpdate: true,
      isDeleted: false,

      userIds: [],
      groupColor: "#a2d9ce",
      groupType: "DYNAMIC",
      isDefault: true,
    },
    {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      name: "Attention Required Users",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 3,
          visitType: "ABOVE",
          spend: 150,
          spendType: "ABOVE",
        },
      ],
      autoUpdate: true,
      isDeleted: false,

      __v: 0,
      userIds: [],
      groupColor: "#c0392b",
      groupType: "DYNAMIC",
      isDefault: true,
    },
    {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      name: "Lost Users",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 1,
          visitType: "ABOVE",
          spend: 100,
          spendType: "ABOVE",
        },
      ],
      autoUpdate: true,
      isDeleted: false,

      __v: 0,
      userIds: [],
      groupColor: "#e74c3c",
      groupType: "DYNAMIC",
      isDefault: true,
    },
    {
      afternoon: false,
      evening: false,
      night: false,
      name: "morning customer",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 1,
          visitType: "ABOVE",
          spend: 1,
          spendType: "ABOVE",
          tags: [],
        },
      ],
      autoUpdate: true,
      groupColor: "#884ea0",
      isDeleted: false,

      userIds: [],
      groupType: "DYNAMIC",
      isDefault: false,
      morning: true,
    },
    {
      morning: false,
      afternoon: true,
      evening: false,
      night: false,
      name: "afternoon customer",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 1,
          visitType: "ABOVE",
          spend: 1,
          spendType: "ABOVE",
          tags: [],
        },
      ],
      autoUpdate: true,
      groupColor: "#2ecc71",
      isDeleted: false,
      createdAt: "2024-08-03T06:16:38.355Z",
      updatedAt: "2025-06-02T12:43:50.075Z",
      __v: 0,
      userIds: [],
      groupType: "DYNAMIC",
      isDefault: false,
    },
    {
      morning: false,
      afternoon: false,
      evening: true,
      night: false,
      name: "evening customer",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 1,
          visitType: "ABOVE",
          spend: 1,
          spendType: "ABOVE",
          tags: [],
        },
      ],
      autoUpdate: true,
      groupColor: "#a569bd",
      isDeleted: false,
      userIds: [],

      groupType: "DYNAMIC",
      isDefault: false,
    },
    {
      morning: false,
      afternoon: false,
      evening: false,
      night: true,
      name: "late night customer",
      businessId: businessId,
      description: "This is a sample group description.",
      filter: [
        {
          duration: 30,
          visit: 1,
          visitType: "ABOVE",
          spend: 1,
          spendType: "ABOVE",
          tags: [],
        },
      ],
      autoUpdate: true,
      groupColor: "#f5b7b1",
      isDeleted: false,
      userIds: [],

      groupType: "DYNAMIC",
      isDefault: false,
    },
  ];

  return defaultGroups;
};

export const matchConditionDnamicGroup = (
  data: Record<string, any>,
  condition: any,
) => {
  return Object.values(data).filter((user) => {
    let visitMatch = true;
    let spendMatch = true;
    let cardBalanceMatch = true;
    let coinzIssuedMatch = true;
    let coinzUsedMatch = true;

    if (condition.visitType) {
      switch (condition.visitType) {
        case "ABOVE":
          visitMatch = user.visit > condition.visit;
          break;
        case "BELOW":
          visitMatch = user.visit < condition.visit;
          break;
        case "EQUAL":
          visitMatch = user.visit === condition.visit;
          break;
      }
    }

    if (condition.spendType) {
      switch (condition.spendType) {
        case "ABOVE":
          spendMatch = user.spend > condition.spend;
          break;
        case "BELOW":
          spendMatch = user.spend < condition.spend;
          break;
        case "EQUAL":
          spendMatch = user.spend === condition.spend;
          break;
      }
    }

    if (condition.cardBalanceType) {
      switch (condition.cardBalanceType) {
        case "ABOVE":
          cardBalanceMatch = user.cardBalance > condition.cardBalance;
          break;
        case "BELOW":
          cardBalanceMatch = user.cardBalance < condition.cardBalance;
          break;
        case "EQUAL":
          cardBalanceMatch = user.cardBalance === condition.cardBalance;
          break;
      }
    }

    if (condition.coinzIssuedType) {
      switch (condition.coinzIssuedType) {
        case "ABOVE":
          coinzIssuedMatch = user.coinzIssued > condition.coinzIssued;
          break;
        case "BELOW":
          coinzIssuedMatch = user.coinzIssued < condition.coinzIssued;
          break;
        case "EQUAL":
          coinzIssuedMatch = user.coinzIssued === condition.coinzIssued;
          break;
      }
    }

    if (condition.coinzUsedType) {
      switch (condition.coinzUsedType) {
        case "ABOVE":
          coinzUsedMatch = user.coinzUsed > condition.coinzUsed;
          break;
        case "BELOW":
          coinzUsedMatch = user.coinzUsed < condition.coinzUsed;
          break;
        case "EQUAL":
          coinzUsedMatch = user.coinzUsed === condition.coinzUsed;
          break;
      }
    }

    return (
      visitMatch &&
      spendMatch &&
      cardBalanceMatch &&
      coinzIssuedMatch &&
      coinzUsedMatch
    );
  });
};
