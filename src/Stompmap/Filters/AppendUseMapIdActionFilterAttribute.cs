using Microsoft.AspNet.Mvc.Filters;
using Microsoft.AspNet.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stompmap.Filters
{
    public class AppendUseMapIdActionFilterAttribute : ActionFilterAttribute
    {
        public bool UseIdOnMap { get; set; }

        public AppendUseMapIdActionFilterAttribute(bool useMapId) {
            UseIdOnMap = useMapId;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            dynamic viewData = ((Controller)context.Controller).ViewData;

            viewData["UseIdOnMap"] = UseIdOnMap;

        }
    }
}
