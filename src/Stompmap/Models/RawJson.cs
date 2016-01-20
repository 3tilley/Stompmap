using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stompmap.Models
{
    public class RawJson
    {
        public int Id { get; set; }

        public JRaw jRaw { get; set; }

        [JsonIgnore]
        public string Serialised
        {
            get { return jRaw.Value.ToString(); }
            set { JToken.Parse(value); }
        }
    }
}
