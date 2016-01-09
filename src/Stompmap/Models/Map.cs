using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Stompmap.Models
{
    public class Map
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }

        [Display(Name = "Map Centre Latitude")]
        [Range(-85.0, 85.0, ErrorMessage = "The {0} must be between {1} and {2}")]
        public double CentreLatitude { get; set; }

        [Display(Name = "Map Centre Longtitude")]
        [Range(-180.0, 180.0, ErrorMessage = "The {0} must be between {1} and {2}")]
        public double CentreLongtitude { get; set; }

        [Display(Name = "Zoom Level")]
        [Range(0, 15, ErrorMessage = "The {0} must be between {1} and {2}")]
        public int ZoomLevel { get; set; }

        public ICollection<Marker> Markers { get; set; }
    }
}
