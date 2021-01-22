using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TweetsReplay.Models;
using Microsoft.Extensions.Configuration;
using CoreTweet;

namespace TweetsReplay.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TweetsReplayController : ControllerBase
    {

        private readonly IConfiguration config;

        public TweetsReplayController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet]
        public List<Tweet> Get(string keyword, string sinceDateTime, string untilDateTime)
        {
            var consumerKey = config["Twitter:ConsumerKey"];
            var consumerSecret = config["Twitter:ConsumerSecret"];
            var accessToken = config["Twitter:AccessToken"];
            var accessSecret = config["Twitter:AccessSecret"];

            var tokens = Tokens.Create(consumerKey, consumerSecret, accessToken, accessSecret);

            var startDateTime = DateTime.Parse(sinceDateTime, null, System.Globalization.DateTimeStyles.RoundtripKind);
            var endDateTime = DateTime.Parse(untilDateTime, null, System.Globalization.DateTimeStyles.RoundtripKind);

            var twitterDateTimeFormat = "yyyy-MM-dd_HH:mm:ss_UTC";

            var queryString = $"{keyword} -filter:retweets";
            var nextMaxId = Int64.MaxValue;

            var responseList = new List<Status>();

            for (int i = 0; i < 450; i++)
            {
                var result = tokens.Search.Tweets(keyword, until: endDateTime.ToString(twitterDateTimeFormat), max_id: nextMaxId, result_type: "recent", count: 100);
                nextMaxId = Int64.Parse(result.SearchMetadata.NextResults.Split("max_id=")[1].Split("&")[0]);
                var list = result
                              .OrderBy(x => x.Id)
                              .ToList();

                responseList = list.Concat(responseList).ToList();

                if (result.OrderBy(x => x.CreatedAt).FirstOrDefault().CreatedAt < startDateTime)
                {
                    break;
                }
            }

            var resultList = responseList
                .Where(x => x.CreatedAt >= startDateTime && x.Text.ToLower() != keyword.ToLower() && !x.Text.Contains("RT"))
                .Select(x => new Tweet
                {
                    TweetId = x.Id,
                    CreatedAt = x.CreatedAt.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'"),
                    Text = x.Text
                })
                .ToList();

            return resultList;
        }


    }
}
