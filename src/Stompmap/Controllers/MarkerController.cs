using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using Stompmap.Models;
using Stompmap.Filters;

namespace Stompmap.Controllers
{
    [AppendUseMapIdActionFilter(false)]
    public class MarkerController : Controller
    {
        private ApplicationDbContext _context;

        public MarkerController(ApplicationDbContext context)
        {
            _context = context;    
        }

        // GET: Marker
        public async Task<IActionResult> Index()
        {
            var applicationDbContext = _context.Marker.Include(m => m.Map);
            return View(await applicationDbContext.ToListAsync());
        }

        // GET: Marker/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.Id == id);
            if (marker == null)
            {
                return HttpNotFound();
            }

            return View(marker);
        }

        // GET: Marker/Create
        public IActionResult Create()
        {
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name");
            return View();
        }

        // POST: Marker/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Marker marker)
        {
            if (ModelState.IsValid)
            {
                //marker.AddIdOnMap();
                _context.Marker.Add(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View(marker);
        }

        // GET: Marker/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.Id == id);
            if (marker == null)
            {
                return HttpNotFound();
            }
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View(marker);
        }

        // POST: Marker/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Marker marker)
        {
            if (ModelState.IsValid)
            {
                _context.Update(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View(marker);
        }

        // GET: Marker/Delete/5
        [ActionName("Delete")]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.Id == id);
            if (marker == null)
            {
                return HttpNotFound();
            }

            return View(marker);
        }

        // POST: Marker/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            Marker marker = await _context.Marker.SingleAsync(m => m.Id == id);
            _context.Marker.Remove(marker);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }
    }
}
