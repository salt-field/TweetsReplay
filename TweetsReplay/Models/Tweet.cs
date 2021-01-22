using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TweetsReplay.Models
{
    public class Tweet
    {
        public long TweetId { get; set; }
        public string Text { get; set; }
        public string CreatedAt { get; set; }
    }
}
