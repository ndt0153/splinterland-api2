const ta = require("time-ago");
const axios = require("axios");
const date = require("date-and-time");
var Table = require("cli-table");
const saveData = require("./save");
const getInfo = async (username, callback) => {
  const req1 = axios.get(
    "https://api2.splinterlands.com/battle/history?player=" +
      username.toLowerCase()
  );
  const req2 = axios.get(
    "https://api2.splinterlands.com/players/balance_history?token_type=DEC&offset=0&limit=500&v=1630134828010&token=7O6I59GSSG&username=" +
      username
  );
  const req3 = axios.get(
    "https://api.splinterlands.io/players/balances?username=" +
      username.toLowerCase()
  );
  const req4 = axios.get(
    "https://api2.splinterlands.com/players/quests?username=" +
      username.toLowerCase()
  );
  const req5 = axios.get(
    "https://api2.splinterlands.com/players/details?name=" +
      username.toLowerCase()
  );
  const req6 = axios.get(
    `https://api.steemmonsters.io/players/history?username=${username.toLowerCase()}&from_block=-1&limit=250&types=pack_purchase,open_pack,open_all,market_purchase,market_sale,gift_cards,gift_packs,combine_cards,combine_all,sell_cards,cancel_sell,card_award,claim_reward,mystery_reward,market_rent,market_renew_rental,market_list,market_cancel_rental`
  );
  const req7 = axios.get(
    "https://api2.splinterlands.com/battle/history2?player=" +
      username.toLowerCase()
  );
  //console.log(process.argv[3] == "backup");
  if (process.argv[3] == "backup") {
    await Promise.all([req1, req2, req3, req4, req5])
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
    return;
  } else {
    await Promise.all([req1, req2, req3, req4, req5, req6, req7])
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
};

function getLastestClaimQuestTime(data5) {
  if (data5.data && data5.data.length > 0) {
    const lastestClaim = data5.data.find((item) => item.type == "claim_reward");
    return ta.ago(new Date(lastestClaim.created_date));
  }
  return "Network Error";
}
function getAfkGame(data6) {
  if (data6.data && data6.data.battles.length > 0) {
    const afkGames = data6.data.battles.filter(
      (item) => !item.details.team1 && item.details.loser == data6.data.player
    );
    return afkGames.length;
  }
  return -1;
}

function getRewardsQuestDEC(data1) {
  const lastestDecRewardClaimed = data1.data.find(
    (item) => item.type === "quest_rewards"
  );
  if (lastestDecRewardClaimed) {
    return {
      timeClaim: ta.ago(new Date(lastestDecRewardClaimed.created_date)),
      amount: lastestDecRewardClaimed.amount + "",
    };
  }
  return {};
}
const getBattlesResult = (data0, username) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  let todayBattles = data0.data.battles.filter((battle) => {
    return date.isSameDay(today, new Date(battle.created_date));
  });
  if (todayBattles.length < 1) {
    return {
      win: -1,
      lose: -1,
      draw: -1,
      total: -1,
      winRate: 0,
      lastest: ta.ago(new Date(data0.data.battles[0].created_date)),
    };
  }
  const winCount = todayBattles.filter(
    (item) => username === item.winner
  ).length;
  const drawCount = todayBattles.filter(
    (item) => "DRAW" === item.winner
  ).length;

  return {
    win: winCount,
    lose: todayBattles.length - winCount - drawCount,
    draw: drawCount,
    total: todayBattles.length,
    winRate: ((winCount * 100) / (todayBattles.length - drawCount)).toFixed(2),
    lastest: ta.ago(new Date(todayBattles[0].created_date)),
  };
};

const getBalance = (data2) => {
  if (!data2) {
    return {};
  }
  let result = data2.data.find((item) => item.token === "DEC");
  if (result) {
    return result.balance;
  }
  return 0;
};

const getQuest = (data3) => {
  if (data3) {
    let quest = data3.data[0];
    if (quest.completed_items === quest.total_items && !quest.claim_date) {
      return "Available";
    }
    if (quest.completed_items !== quest.total_items) {
      return `${quest.name} - ${quest.completed_items}`;
    }
    if (quest.claim_date) {
      return "Completed";
    }
  }
};

const getDetails = (data4) => {
  if (!data4) {
    return {};
  }
  return {
    erc: data4.data.capture_rate / 100,
    rating: data4.data.rating,
    power: data4.data.collection_power,
  };
};
const checkInfo = async (userList) => {
  const table = new Table({
    style: { head: ["green"] },
    head: [
      "",
      "Username",
      "DEC",
      "ERC",
      "Rating",
      "Power",
      "Win",
      "Lose",
      "Draw",
      "Total",
      "Win Rate",
      "Quest",
      "Lastest game",
      "Lastest DEC quest",
      "Lastest claim quest",
      "AFK",
    ],
  });
  let result = [];
  for (const username of userList) {
    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        //console.log("Getting data of user: %s", username);

        let battleResult;
        let balance;
        let details;
        let quest;
        let reward;
        let lastestQuest;
        let afk;
        await getInfo(username, (result) => {
          battleResult = getBattlesResult(result[0], username);
          balance = getBalance(result[2]);
          details = getDetails(result[4]);
          quest = getQuest(result[3]);
          reward = getRewardsQuestDEC(result[1]);
          afk = getAfkGame(result[6]);
          if (process.argv[3] == "backup") {
            lastestQuest = "Ignore";
          } else {
            lastestQuest = getLastestClaimQuestTime(result[5]);
          }
        });
        let result2 = [];
        let data = {
          ...{
            username: username,
            balance: balance,
            quest: quest,
          },
          ...details,
          ...battleResult,
          ...reward,
          lastestQuest,
          afk,
        };
        result2.push(data);
        let filter = process.argv[2];
        let i = 9;
        if (filter === "username") {
          i = 0;
        }
        if (filter === "rating") {
          i = 3;
        }
        if (filter === "power") {
          i = 4;
        }
        if (filter === "total") {
          i = 8;
        }
        if (filter === "dec") {
          i = 1;
        }
        if (filter === "quest") {
          i = 10;
        }
        if (filter === "erc") {
          i = 2;
        }
        if (filter === "lgame") {
          i = 11;
        }
        if (filter === "questtime") {
          i = 13;
        }
        if (filter === "afk") {
          i = 14;
        }

        var dataTable = result2
          .map((item) => {
            return [
              item.username ?? "",
              item.balance ?? 0,
              item.erc ?? 0,
              item.rating ?? 0,
              item.power ?? 0,
              item.win ?? 0,
              item.lose ?? 0,
              item.draw ?? 0,
              item.total ?? 0,
              item.winRate ?? 0,
              item.quest ?? "",
              item.lastest ?? "",
              item.amount
                ? item.amount + "  -  " + item.timeClaim
                : "Not found",
              item.lastestQuest ?? "999 days ago",
              item.afk ?? -1,
            ];
          })
          .sort((a, b) => {
            if (i === 10) {
              return a[i].localeCompare(b[i]);
            }
            if (i === 13) {
              console.log(a[i], b[i]);
              return (
                ta.timefriendly(a[i].split(" ").slice(0, 2).join(" ")) -
                ta.timefriendly(b[i].split(" ").slice(0, 2).join(" "))
              );
            }
            return a[i] - b[i];
          });
        // console.log(dataTable);
        const result3 = dataTable.map(function (ele, index) {
          return {
            id: index + 1,
            username: ele[0],
            dec: ele[1],
            erc: ele[2],
            rating: ele[3],
            power: ele[4],
            win: ele[5],
            lose: ele[6],
            draw: ele[7],
            total: ele[8],
            winrate: ele[9],
            quest: ele[10],
            lastgame: ele[11],
            lastdec: ele[12],
            lastclaim: ele[13],
            afk: ele[14],
          };
        });
        console.log(result3);
        result3.forEach((item) => {
          const {
            username,
            dec,
            erc,
            rating,
            power,
            win,
            lose,
            draw,
            total,
            winrate,
            quest,
            lastgame,
            lastdec,
            lastclaim,
            afk,
          } = item;
          saveData.updateUser(
            username,
            dec,
            erc,
            rating,
            power,
            win,
            lose,
            draw,
            total,
            winrate,
            quest,
            lastgame,
            lastdec,
            lastclaim,
            afk
          );
        });
        resolve(result);
        //return dataTable;
        // console.log("Done: %s", username);
      }, 600);
    });
  }

  let totalDEC = 0;
  let totalPower = 0;
  /* dataTable.forEach((data, index) => {
    table.push([index + 1, ...data]);
    totalDEC += parseInt(data[1]);
    totalPower += parseInt(data[4]);
  });
  return dataTable; */
};

const main = async (userList) => {
  const userlist = ["alsinahrroulekqv", "basdenjgruscio0", "critzinbeasxve"];
  const raw = await checkInfo(userList);
  /*  const result = raw.map(function (ele, index) {
    return {
      id: index + 1,
      username: ele[0],
      dec: ele[1],
      erc: ele[2],
      rating: ele[3],
      power: ele[4],
      win: ele[5],
      lose: ele[6],
      draw: ele[7],
      total: ele[8],
      winrate: ele[9],
      quest: ele[10],
      lastgame: ele[11],
      lastdec: ele[12],
      lastclaim: ele[13],
      afk: ele[14],
    };
  }); */
  //return result;
};
module.exports = main;
