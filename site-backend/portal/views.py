import logging

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_utils import hash_password, issue_token, verify_password, volunteer_from_token
from .coordinator_client import build_system_overview, coordinator_get
from .gamification import compute_badges, compute_points
from .models import SiteVolunteer
from .serializers import (
    SiteVolunteerPublicSerializer,
    VolunteerLoginSerializer,
    VolunteerRegisterSerializer,
)

logger = logging.getLogger(__name__)

MISSION_DATA = {
    "title": "VolunSys-UY1, plateforme de calcul volontaire",
    "institution": "Universite de Yaounde I",
    "platform_description": (
        "VolunSys-UY1 est une plateforme de calcul distribue sur machines volontaires, "
        "pensee pour l'Afrique. Elle permet aux chercheurs, "
        "universites et entreprises de soumettre des calculs intensifs, simulations, "
        "entrainement de modeles et traitement de donnees, executes par une communaute "
        "de volontaires qui pretent la puissance inutilisee de leurs ordinateurs."
    ),
    "main_objective": (
        "Mettre en reseau la puissance de calcul des machines personnelles pour "
        "accelerer la recherche scientifique et les projets a forte exigence "
        "computationnelle en Afrique centrale."
    ),
    "specific_objectives": [
        "Permettre a toute personne de contribuer au calcul scientifique en partageant les ressources libres de son ordinateur.",
        "Offrir aux chercheurs et formateurs un acces a une capacite de calcul distribuee pour simulations, analyses et entrainement de modeles.",
        "Executer les taches de maniere securisee dans des conteneurs isoles, sans compromettre les donnees personnelles du volontaire.",
        "Suivre en temps reel l'avancement des workflows et la participation de la communaute.",
        "Reconnaitre les contributeurs par un systeme de points et de badges base sur leur participation effective.",
    ],
    "pillars": [
        {
            "title": "Calcul partage",
            "description": "Chaque machine volontaire renforce la capacite globale du reseau.",
        },
        {
            "title": "Science ouverte",
            "description": "Simulations, modelisation et traitement massif de donnees accessibles.",
        },
        {
            "title": "Participation communautaire",
            "description": "Inscription simple, suivi transparent, impact visible pour chaque contributeur.",
        },
        {
            "title": "Securite",
            "description": "Execution via runtime vc-uyr (bundles), controle des ressources, isolement des taches.",
        },
    ],
    "gamification_badges": [
        {"id": "first-step", "name": "Premier pas", "description": "Premiere connexion ou premiere tache executee", "min_points": 0},
        {"id": "science", "name": "Scientifique solidaire", "description": "Au moins 3 taches executees avec succes", "min_points": 300},
        {"id": "regular", "name": "Contributeur regulier", "description": "Au moins 5 taches executees", "min_points": 500},
        {"id": "reliable", "name": "Fiabilite exemplaire", "description": "10 taches ou plus avec un taux de reussite eleve", "min_points": 1000},
        {"id": "community", "name": "Champion communautaire", "description": "500 points ou plus accumules", "min_points": 500},
        {"id": "ambassador", "name": "Ambassadeur UY1", "description": "20 taches ou plus, pilier du reseau", "min_points": 2000},
    ],
    "participation_benefits": [
        "Contribuer a la science sans cout, en utilisant uniquement le temps processeur libre de votre machine.",
        "Gagner des points et des badges visibles sur le classement communautaire.",
        "Suivre en direct l'impact de votre machine sur les calculs en cours.",
        "Rejoindre un reseau de calcul volontaire accessible a tous.",
    ],
}


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "vcuy-public-site"})


class SystemOverviewView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        overview = build_system_overview()
        overview["fetched_at"] = timezone.now().isoformat()
        return Response(overview)


class PublicStatsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        overview = build_system_overview()
        return Response(
            {
                "active_volunteers": overview["active_volunteers"],
                "total_volunteers": overview["total_volunteers"],
                "total_tasks": overview["total_tasks"],
                "completed_tasks": overview["completed_tasks"],
                "total_workflows": overview["total_workflows"],
                "system_status": overview["system_status"],
                "live": overview["live"],
                "fetched_at": timezone.now().isoformat(),
            }
        )


class VolunteersListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        volunteers = coordinator_get("volunteers/") or []
        if not isinstance(volunteers, list):
            volunteers = []
        return Response({"count": len(volunteers), "results": volunteers})


class MissionView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response(MISSION_DATA)


class BadgesView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        volunteers = coordinator_get("volunteers/") or []
        if not isinstance(volunteers, list):
            volunteers = []

        entries = []
        for v in volunteers:
            if not isinstance(v, dict):
                continue
            points = compute_points(v)
            perf = v.get("performance") or {}
            entries.append(
                {
                    "pseudonym": v.get("name") or v.get("pseudonym") or "Volontaire",
                    "status": v.get("current_status", "unknown"),
                    "points": points,
                    "tasks_completed": int(perf.get("tasks_completed", 0)),
                    "tasks_total": int(perf.get("tasks_total", 0)),
                    "badges": compute_badges(v, points),
                }
            )

        leaderboard = sorted(entries, key=lambda x: x["points"], reverse=True)[:15]
        badge_catalog = MISSION_DATA.get("gamification_badges", [])

        return Response(
            {
                "catalog": badge_catalog,
                "leaderboard": leaderboard,
                "points_rules": {
                    "task_completed": 100,
                    "task_assigned": 25,
                    "available_bonus": 50,
                    "busy_bonus": 30,
                    "gpu_bonus": 20,
                },
                "registered_on_site": SiteVolunteer.objects.count(),
                "live_volunteers": len(volunteers),
            }
        )


class AnalyticsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        overview = build_system_overview()
        total_tasks = overview["total_tasks"]
        completed = overview["completed_tasks"]
        total_vol = overview["total_volunteers"]
        active = overview["active_volunteers"]
        completion_rate = round((completed / total_tasks) * 100, 1) if total_tasks else 0
        utilization = round((active / total_vol) * 100, 1) if total_vol else 0
        registered_site = SiteVolunteer.objects.count()

        return Response(
            {
                "active_volunteers": active,
                "total_volunteers": total_vol,
                "total_tasks": total_tasks,
                "completed_tasks": completed,
                "running_tasks": overview["running_tasks"],
                "total_workflows": overview["total_workflows"],
                "completion_rate": completion_rate,
                "utilization_rate": utilization,
                "registered_on_site": registered_site,
                "volunteers_by_status": overview["volunteers_by_status"],
                "tasks_by_status": overview["tasks_by_status"],
                "system_status": overview["system_status"],
                "live": overview["live"],
                "fetched_at": timezone.now().isoformat(),
            }
        )


class VolunteerRegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = VolunteerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if SiteVolunteer.objects.filter(email=data["email"]).exists():
            return Response({"detail": "Cet email est deja utilise."}, status=status.HTTP_400_BAD_REQUEST)
        if SiteVolunteer.objects.filter(pseudonym=data["pseudonym"]).exists():
            return Response({"detail": "Ce pseudonyme est deja pris."}, status=status.HTTP_400_BAD_REQUEST)

        volunteer = SiteVolunteer.objects.create(
            pseudonym=data["pseudonym"],
            email=data["email"],
            password_hash=hash_password(data["password"]),
        )
        token = issue_token(volunteer)
        return Response(
            {
                "token": token,
                "volunteer": SiteVolunteerPublicSerializer(volunteer).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VolunteerLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = VolunteerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            volunteer = SiteVolunteer.objects.get(email=data["email"])
        except SiteVolunteer.DoesNotExist:
            return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

        if not verify_password(data["password"], volunteer.password_hash):
            return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

        token = issue_token(volunteer)
        return Response(
            {
                "token": token,
                "volunteer": SiteVolunteerPublicSerializer(volunteer).data,
            }
        )


class VolunteerMeView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer", "").strip() if auth else request.headers.get("X-Volunteer-Token", "")
        volunteer = volunteer_from_token(token)
        if not volunteer:
            return Response({"detail": "Authentification requise."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(SiteVolunteerPublicSerializer(volunteer).data)


class InstallGuideView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer", "").strip() if auth else request.headers.get("X-Volunteer-Token", "")
        if not volunteer_from_token(token):
            return Response(
                {"detail": "Inscription ou connexion requise avant l'acces au guide."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        repo = settings.VOLUNTEER_REPO_URL.rstrip("/")
        raw_base = repo.replace("https://github.com/", "https://raw.githubusercontent.com/") + "/main"
        # Une seule commande : install + demarrage arriere-plan (systemd user) + reboot
        # Runtime compat (sans Ashley / sans sudo) — meme commande pour install et mise a jour
        one_liner_linux = f"curl -fsSL {raw_base}/get-volontaire.sh | bash"
        one_liner_linux_service = (
            f"curl -fsSL {raw_base}/get-volontaire.sh | bash"
        )
        one_liner_linux_uninstall = (
            "systemctl --user disable --now vc-uy-volunteer vc-uy-agent vc-uy-runtime 2>/dev/null; "
            "rm -f ~/.config/systemd/user/vc-uy-*.service; "
            "systemctl --user daemon-reload; "
            "cd ~/VC-UY/volunteer-app-2025 && chmod +x uninstall-volontaire.sh && ./uninstall-volontaire.sh"
        )
        one_liner_agent_uninstall = (
            "systemctl --user disable --now vc-uy-volunteer vc-uy-agent vc-uy-runtime vc-agent.service 2>/dev/null; "
            "rm -f ~/.config/systemd/user/vc-uy-*.service ~/.config/systemd/user/vc-agent.service; "
            "systemctl --user daemon-reload; "
            "pkill -f 'agent/main.py' 2>/dev/null; "
            "pkill -f 'runtime_compat_server.py' 2>/dev/null; true"
        )
        one_liner_windows = (
            f"irm {raw_base}/get-volontaire.ps1 | iex"
        )
        return Response(
            {
                "repository": repo,
                "one_liner_linux": one_liner_linux,
                "one_liner_linux_service": one_liner_linux_service,
                "one_liner_linux_uninstall": one_liner_linux_uninstall,
                "one_liner_agent_uninstall": one_liner_agent_uninstall,
                "one_liner_windows": one_liner_windows,
                "requirements": [
                    "Python 3.10 ou superieur",
                    "curl (Linux/macOS) ou PowerShell (Windows)",
                    "4 Go de RAM recommandes",
                    "Connexion Internet stable",
                    "Pas besoin de Git — installation par archive",
                    "Pas besoin de sudo / Ashley : runtime compat Python par defaut",
                    "Install legere (~100 Mo) : PyTorch/CIFAR telecharges seulement a la 1re tache DL",
                    "Linux : demarrage en arriere-plan (fermer le terminal OK) + relance au reboot",
                    "Deja installe : relancer la meme commande one-liner pour basculer en compat",
                ],
                "verification": [
                    "Interface accessible sur http://localhost:8003 (vous pouvez fermer le terminal)",
                    "Runtime : curl -sf http://127.0.0.1:7070/api/health (doit contenir vc-uyr-compat ; sinon :7072)",
                    "Statut « disponible » dans l'application",
                    "Agent prediction : http://127.0.0.1:7071/health",
                    "systemctl --user status vc-uy-runtime vc-uy-volunteer",
                    "Logs : ~/VC-UY/volunteer-app-2025/volontaire/.volunteer/logs/",
                    "Snapshots visibles sur le site (onglet Donnees recherche)",
                ],
                "uninstall_steps": [
                    "1. Arreter les services systemd vc-uy-* (commande desinstallation ci-dessous)",
                    "2. Lancer uninstall-volontaire.sh si present",
                    "3. Optionnel : supprimer le dossier ~/VC-UY/volunteer-app-2025",
                    "4. Vous n'etes plus contributeur : plus de taches ni de telemetrie envoyee",
                ],
            }
        )
