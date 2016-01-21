using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Stompmap.Models
{

        //name: name,
        //description: description,
        //latLng: latLng,
        //category : category,
        //address : address,
        //geocoderResult : geocoderResult,
        //icon: icon
    public class Marker
    {
        public int Id { get; set; }
        
        public int IdOnMap { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        [Range(-85.0, 85.0, ErrorMessage = "The {0} must be between {1} and {2}")]
        public double Latitude { get; set; }

        [Range(-180.0, 180.0, ErrorMessage = "The {0} must be between {1} and {2}")]
        public double Longtitude { get; set; }

        public string Category { get; set; }

        public string Address { get; set; }

        public string GeocoderResult {
            get;
            set;
            }

        public string Icon { get; set; }

        public int MapId { get; set; }

        public bool HasBeenVisited { get; set; }

        public bool IsPartialResult { get; set; }

        [JsonIgnore]
        public Map Map { get; set; }

    }


}
